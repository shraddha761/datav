// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useMemo } from "react"
import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Input, Flex, Box, useToast, Text, Switch, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, useMediaQuery } from "@chakra-ui/react"
import { DetailAlert, DetailAlertItem } from "src/components/DetailAlert"
import RadionButtons from "src/components/RadioButtons"
import DatasourceSelect from "src/components/datasource/Select"
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import { Form, FormSection } from "src/components/form/Form"
import { concat, isArray, isEmpty } from "lodash"
import { useEffect, useRef, useState } from "react"
import { initVariable } from "src/data/variable"


import { Variable, VariableQueryType, VariableRefresh } from "types/variable"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import { queryVariableValues } from "src/views/variables/SelectVariable"
import storage from "utils/localStorage"
import { VariableManuallyChangedKey } from "src/data/storage-keys"
import { dispatch } from "use-bus"
import { VariableForceReload } from "src/data/bus-events"
import FormItem from "src/components/form/Item"
import { useStore } from "@nanostores/react"
import { cfgVariablemsg, commonMsg } from "src/i18n/locales/en"
import { getDatasource } from "utils/datasource"
import { addParamToUrl, removeParamFromUrl } from "utils/url"
import { useSearchParam } from "react-use"
import { $datasources } from "src/views/datasource/store"
import { Team } from "types/teams"
import { externalDatasourcePlugins } from "src/views/dashboard/plugins/external/plugins"
import Loading from "components/loading/Loading"
import { builtinDatasourcePlugins } from "src/views/dashboard/plugins/built-in/plugins"




const TeamVariablesPage = ({team}:{team:Team})  => {
    const t = useStore(commonMsg)
    const editVar = useSearchParam('editVar')
    const toast = useToast()
    const [variables, setVariables] = useState<Variable[]>(null)
    const [variable, setVariable] = useState<Variable>()
    const [editMode, setEditMode] = useState<boolean>(false)

    useEffect(() => {
        if (variables?.length > 0 && editVar) {
            onEditVariable(variables.find(v => v.id.toString() == editVar))
        }
    }, [variables, editVar])

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get(`/variable/all?teamId=${team.id}`)
        setVariables(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const onAddVariable = () => {
        setEditMode(false)
        setVariable({
            id: 0,
            ...initVariable
        })
        onOpen()
    }

    const addVariable = async (v: Variable) => {
        if (!v.name) {
            toast({
                title: t.isReqiiured({ name: t.itemName({ name: t.variable }) }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        await requestApi.post("/variable/new", {...v, teamId: team.id})
        onClose()
        toast({
            title: t.isAdded({ name: t.variable }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setVariable(null)
        window.location.reload()
    }



    const onEditVariable = (variable) => {
        setVariable(variable)
        onOpen()
        setEditMode(true)
        addParamToUrl({ 'editVar': variable.id })
    }


    const editVariable = async (v: Variable) => {
        if (!v.name) {
            toast({
                title: t.isReqiiured({ name: t.itemName({ name: t.variable }) }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        await requestApi.post("/variable/update", v)
        onClose()
        toast({
            title: t.isUpdated({ name: t.variable }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        removeParamFromUrl(['editVar'])
        window.location.reload()
    }

    const onRemoveVariable = async (v: Variable) => {
        await requestApi.delete(`/variable/${v.id}`,)
        onClose()
        toast({
            title: t.isDeleted({ name: t.variable }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        window.location.reload()
    }

    return <>
        <Box>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddVariable}>{t.newItem({ name: t.variable })}</Button>
            </Flex>
            {variables ? 
            <VariablesTable variables={variables} onEdit={onEditVariable} onRemove={onRemoveVariable} /> 
            : <Loading style={{marginTop: '50px'}}/>}
        </Box>
        {variable && <EditVariable key={variable.id} v={variable} isEdit={editMode} onClose={() => {
            removeParamFromUrl(['editVar'])
            onClose()
        }} isOpen={isOpen} onSubmit={editMode ? editVariable : addVariable} isGlobal />}
    </>
}


export default TeamVariablesPage

interface TableProps {
    variables: Variable[]
    onEdit: any
    onRemove: any
}

export const VariablesTable = ({ variables, onEdit, onRemove }: TableProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgVariablemsg)
    const datasources = useStore($datasources)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedVariable, setSelectedVariable] = useState<Variable>(null)

    const toast = useToast()
    const reloadValues = (id, name) => {
        storage.remove(VariableManuallyChangedKey + id)
        dispatch(VariableForceReload + id)
        toast({
            description: t1.valueUpdated({ name }),
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    }
    const cancelRef = useRef()

    const onRemoveClose = () => {
        setSelectedVariable(null)
        onClose()
    }
    const [isLargeScreen] = useMediaQuery('(min-width: 900px)')
    return (<>
        {variables.length > 0 ? <TableContainer>
            <Table variant="simple" className="color-border-table">
                <Thead>
                    <Tr>
                        <Th>{t.itemName({ name: t.variable })}</Th>
                        {
                            isLargeScreen && <>
                                <Th>{t1.queryType}</Th>
                                <Th>{t.datasource}</Th>
                                <Th>{t.description}</Th>
                            </>
                        }

                        <Th>{t.action}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {variables.map((variable, i) => {
                        return <Tr key={variable.name} className={`${variable.id == selectedVariable?.id ? "highlight-bg" : ''}`}>
                            <Td>{variable.name}</Td>
                            {
                                isLargeScreen && <>
                                    <Td>{t[variable.type]}</Td>
                                    <Td>{datasources?.find(ds => ds.id == variable.datasource)?.name}</Td>
                                    {/* <Td>{t1[variable.refresh]} {variable.refresh == VariableRefresh.Manually && <Button size="sm" mt="-1" variant="ghost" ml="1" onClick={() => reloadValues(variable.id, variable.name)}>{t1.reload}</Button>}</Td> */}
                                    <Td>{variable.description}</Td>
                                </>
                            }
                            <Td>
                                <Button variant="ghost" size="sm" px="0" onClick={() => onEdit(variable)}>{t.edit}</Button>
                                <Button variant="ghost" colorScheme="orange" size="sm" px="0" ml="1" onClick={() => { setSelectedVariable(variable); onOpen() }}>{t.delete}</Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer> :
            <>
                <DetailAlert title={t1.noVariableTitle} status="info">
                    <DetailAlertItem title={t1.whatIsVariable}>
                        <Text mt="2">{t1.whatIsVariableTips} </Text>
                    </DetailAlertItem>

                    <DetailAlertItem title={t1.globalVariable}>
                        <Text mt="2">{t1.globalVariableTips1}</Text>
                        <Text mt="2">{t1.globalVariableTips2}</Text>
                    </DetailAlertItem>
                </DetailAlert>
            </>
        }

        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onRemoveClose}
        >
            <AlertDialogOverlay>
                {selectedVariable && <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {t.deleteItem({ name: t.variable })} - {selectedVariable.name}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t.deleteAlert}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onRemoveClose}>
                            {t.cancel}
                        </Button>
                        <Button colorScheme='red' onClick={() => { onRemove(selectedVariable); onRemoveClose() }} ml={3}>
                            {t.delete}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>}
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

interface EditProps {
    v: Variable
    isOpen: any
    onClose: any
    isEdit: boolean
    onSubmit: any
    isGlobal?: boolean
}


export const EditVariable = ({ v, isOpen, onClose, isEdit, onSubmit, isGlobal = false }: EditProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgVariablemsg)
    const datasources = useStore($datasources)
    const toast = useToast()
    const [variable, setVariable] = useImmer<Variable>(null)
    const [variableValues, setVariableValues] = useState<string[]>([])
    const [displayCount, setDisplayCount] = useState(30)
    useEffect(() => {
        setVariable(v)
    }, [v])

    useEffect(() => {
        queryValues()
    }, [])

    const queryValues = (v0?) => {
        queryVariableValues(v0 ?? v, datasources).then(result => setVariableValues(result.data ?? []))
    }


    const onQueryResult = result => {
        if (!result.error) {
            try {
                let res = result.data
                if (!res) {
                    res = []
                }
                setVariableValues(res)
                return
            } catch (error) {
                result.error = error.message
            }

        }
        toast({
            title: "Error",
            description: result.error,
            status: "error",
            duration: 3000,
            isClosable: true,
        });

        setVariableValues([])
    }

    let currentDatasource;
    if (variable?.datasource) {
        const ds = variable.datasource.toString()
        currentDatasource = getDatasource(ds)
    }

    const filterValues = useMemo(() => {
        if (!isEmpty(variable?.regex)) {
            const regex = variable.regex.toLowerCase()
            return variableValues.filter((v: string) => v.toLowerCase().match(regex))
        } else {
            return variableValues
        }
    }, [variable, variableValues])


    const externalDsList = Object.entries(externalDatasourcePlugins).filter(([k, v]) => v.variableEditor)
    const builtinDsList = Object.entries(builtinDatasourcePlugins).filter(([k, v]) => v.variableEditor)
    const dsPluginList = concat(builtinDsList, externalDsList)
    const dsList = []
    dsPluginList.forEach(([k, v]) => {
        dsList.push(k)
    })

    const PluginEditor = dsPluginList.find(([k, v]) => k == currentDatasource?.type)?.[1]?.variableEditor

    return (<>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent w="600px">
                <ModalHeader>{isEdit ? t.editItem({ name: t.variable }) : t.newItem({ name: t.variable })} </ModalHeader>
                <ModalCloseButton />
                {variable && <ModalBody>
                    <Form maxWidth="600px" sx={{
                        '.form-item-label': {
                            width: "150px"
                        }
                    }}>
                        <FormSection title={t.basicSetting}>
                            <FormItem title={t.name} desc={t1.nameDesc}>
                                <Input placeholder={t1.nameTips} value={variable.name} onChange={e => { setVariable({ ...variable, name: e.currentTarget.value }) }} />
                            </FormItem>
                            <FormItem title={t.description}>
                                <Input placeholder={t1.descTips} value={variable.description} onChange={e => { setVariable({ ...variable, description: e.currentTarget.value }) }} />
                            </FormItem>
                            <FormItem title={t1.refresh}>
                                <RadionButtons options={Object.keys(VariableRefresh).map(k =>
                                    ({ label: t1[k], value: VariableRefresh[k] })
                                )} value={variable.refresh} onChange={(v) => setVariable({ ...variable, refresh: v })} />
                            </FormItem>

                            <FormItem title={t1.multiValue} alignItems="center">
                                <Switch defaultChecked={variable.enableMulti} onChange={(e) => setVariable({ ...variable, enableMulti: e.currentTarget.checked })} />
                            </FormItem>

                            <FormItem title={t1.allValue} alignItems="center">
                                <Switch defaultChecked={variable.enableAll} onChange={(e) => setVariable({ ...variable, enableAll: e.currentTarget.checked })} />
                            </FormItem>

                            <FormItem title={t.sortWeight} desc="Larger weight means higher sort priority when being display in dashboard">
                                <EditorNumberItem size="lg" placeholder="auto" value={variable.sortWeight} min={0} max={100} step={1} onChange={v => { setVariable({ ...variable, sortWeight: v }) }} />
                            </FormItem>

                        </FormSection>

                        <FormSection title={t.query}>
                            <FormItem title={t1.queryType}>
                                <RadionButtons options={Object.keys(VariableQueryType).map(k =>
                                    ({ label: t[VariableQueryType[k]], value: VariableQueryType[k] })
                                )} value={variable.type} onChange={v => {
                                    const newVar = { ...variable, type: v, value: '' }
                                    setVariable(newVar)
                                    setVariableValues([])
                                    if (v == VariableQueryType.Datasource) {
                                        queryValues(newVar)
                                    }
                                }} />
                            </FormItem>

                            {(variable.type == VariableQueryType.Custom) && <FormItem title={t1.queryValue}>
                                <Input width="400px" placeholder={t1.valueTips} value={variable.value} onChange={e => { setVariable({ ...variable, value: e.currentTarget.value?.trim() }) }} onBlur={() => onQueryResult({ error: null, data: variable.value.split(',') })} />
                            </FormItem>}

                            {variable.type == VariableQueryType.Query && <>
                                <FormItem title={t1.selectDs}>
                                    <Box width="100%">
                                        <DatasourceSelect value={variable.datasource} onChange={id => setVariable(v => { v.datasource = id; v.value = "" })} allowTypes={dsList} variant="outline" /></Box>
                                </FormItem>

                                {
                                    PluginEditor && <PluginEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult}/>
                                }
                            </>
                            }
                        </FormSection>

                        <FormSection title={`${t1.regexFilter} ( ${t.optional} )`} >
                            <EditorInputItem value={variable.regex} placeholder={t1.fitlerTips} onChange={v => {
                                setVariable({ ...variable, regex: v })
                            }} />
                        </FormSection>

                        <FormSection title={t1.defaultValue} desc={t1.defaultValueTips} >
                            <Input width="400px" placeholder={"input a default value"} value={variable.default} onChange={e => { setVariable({ ...variable, default: e.currentTarget.value?.trim() }) }} />
                        </FormSection>
                        <FormSection title={t1.varValues} >
                            <Box pt="1">
                                {isArray(filterValues) && filterValues.slice(0, displayCount).map(v => <Tag key={v} size="sm" variant="outline" ml="1">{v}</Tag>)}
                            </Box>
                            {filterValues?.length > displayCount && <Button mt="2" size="sm" colorScheme="gray" ml="1" onClick={() => setDisplayCount(displayCount + 30)}>{t.showMore}</Button>}
                        </FormSection>
                    </Form>
                </ModalBody>}
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        {t.cancel}
                    </Button>
                    <Button variant='ghost' onClick={() => onSubmit(variable)}>{t.submit}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
}
