import { Alert, Box, Button, Divider, Flex, HStack, Image, Input, Modal, ModalBody, ModalContent, ModalOverlay, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Textarea, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { ColorPicker } from "components/color-picker"
import RadionButtons from "components/RadioButtons"
import { isEmpty } from "lodash"
import { useState } from "react"
import * as Icons from 'react-icons/fa'
import { MdEdit } from "react-icons/md"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { NodeGraphIcon, NodeGraphMenuItem, Panel, PanelEditorProps } from "types/dashboard"
import { useImmer } from "use-immer"
import { isJSON } from "utils/is"
import { initPanelSettings } from "../initSettings"


const NodeGraphPanelEditor = (props: PanelEditorProps) => {
    const { panel, onChange } = props
    return (<>
        <PanelAccordion title="Node">
            <PanelEditItem title="base size">
                <Slider aria-label='slider-ex-1' value={panel.settings.nodeGraph.node.baseSize} min={20} max={100} step={2}
                    onChange={v => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.node.baseSize = v
                    })}

                    onChangeEnd={v => onChange(panel => {
                        panel.settings.nodeGraph.node.baseSize = v
                    })}>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb children={panel.settings.nodeGraph.node.baseSize} fontSize='sm' boxSize='25px' />
                </Slider>
            </PanelEditItem>

            <IconSetting {...props} />

            <PanelEditItem title="shape">
                <RadionButtons options={[{ label: "Donut", value: "donut" }, { label: "Circle", value: "circle" }]} value={panel.settings.nodeGraph.node.shape} onChange={v => onChange(panel => {
                    panel.settings.nodeGraph.node.shape = v
                })} />
            </PanelEditItem>
            {panel.settings.nodeGraph.node.shape == 'donut' && <DonutColorsSetting {...props} />}


        </PanelAccordion>


        <PanelAccordion title="Edge">
            <PanelEditItem title="shape">
                <Select value={panel.settings.nodeGraph.edge.shape} onChange={e => onChange(panel => {
                    panel.settings.nodeGraph.edge.shape = e.currentTarget.value
                })}>
                    <option value="quadratic">quadratic</option>
                    <option value="line">line</option>
                    <option value="polyline">polyline</option>
                </Select>
            </PanelEditItem>

            <PanelEditItem title="arrow">
                <Select value={panel.settings.nodeGraph.edge.arrow} onChange={e => onChange(panel => {
                    panel.settings.nodeGraph.edge.arrow = e.currentTarget.value
                })}>
                    <option value="default">default</option>
                    <option value="triangle">triangle</option>
                    <option value="circle">circle</option>
                    <option value="vee">vee</option>
                    <option value="diamond">diamond</option>
                    <option value="triangleRect">triangleRect</option>
                </Select>
            </PanelEditItem>

            <PanelEditItem title="color">
                <HStack>
                    <ColorPicker presetColors={[{ title: 'light-default', color: initPanelSettings.nodeGraph.edge.color.light }]} color={panel.settings.nodeGraph.edge.color.light} onChange={c => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.edge.color.light = c.hex
                    })}>
                        <Button size="sm" variant="outline">Pick light color</Button>
                    </ColorPicker>
                    <Box width="40px" height="30px" background={panel.settings.nodeGraph.edge.color.light}></Box>
                </HStack>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'dark-default', color: initPanelSettings.nodeGraph.edge.color.dark }]} color={panel.settings.nodeGraph.edge.color.dark} onChange={c => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.edge.color.dark = c.hex
                    })}>
                        <Button size="sm" variant="outline">Pick dark color</Button>
                    </ColorPicker>
                    <Box width="40px" height="30px" background={panel.settings.nodeGraph.edge.color.dark}></Box>
                </HStack>
            </PanelEditItem>
            <PanelEditItem title="opacity" desc="color opacity of edge">
                <Slider aria-label='slider-ex-1' value={panel.settings.nodeGraph.edge.opacity} min={0} max={1} step={0.1}
                    onChange={v => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.edge.opacity = v
                    })}

                    onChangeEnd={v => onChange(panel => {
                        panel.settings.nodeGraph.edge.opacity = v
                    })}>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb children={panel.settings.nodeGraph.edge.opacity} fontSize='sm' boxSize='25px' />
                </Slider>
            </PanelEditItem>
            <PanelEditItem title="highlight color" desc="when hover or selected">
                <HStack>
                    <ColorPicker presetColors={[{ title: 'light-default', color: initPanelSettings.nodeGraph.edge.highlightColor.light }]} color={panel.settings.nodeGraph.edge.highlightColor.light} onChange={c => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.edge.highlightColor.light = c.hex
                    })}>
                        <Button size="sm" variant="outline">Pick light color</Button>
                    </ColorPicker>
                    <Box width="40px" height="30px" background={panel.settings.nodeGraph.edge.highlightColor.light}></Box>
                </HStack>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'dark-default', color: initPanelSettings.nodeGraph.edge.highlightColor.dark }]} color={panel.settings.nodeGraph.edge.highlightColor.dark} onChange={c => onChange((panel: Panel) => {
                        panel.settings.nodeGraph.edge.highlightColor.dark = c.hex
                    })}>
                        <Button size="sm" variant="outline">Pick dark color</Button>
                    </ColorPicker>
                    <Box width="40px" height="30px" background={panel.settings.nodeGraph.edge.highlightColor.dark}></Box>
                </HStack>
            </PanelEditItem>
        </PanelAccordion>


        <PanelAccordion title="Interaction">
            <PanelEditItem title="tooltip trigger" info={
                <Text>You need to click Apply Button(in top-right) to see the new trigger taken effect</Text>
            }>
                <RadionButtons options={[{ label: "Hover", value: "mouseenter" }, { label: "Click", value: "click" }]} value={panel.settings.nodeGraph.node.tooltipTrigger} onChange={v => onChange(panel => {
                    panel.settings.nodeGraph.node.tooltipTrigger = v
                })} />
            </PanelEditItem>

            <RightClickMenus {...props} />
        </PanelAccordion>
    </>)
}

export default NodeGraphPanelEditor

const initIcon = { key: '', value: '', icon: '' }
const IconSetting = ({ panel, onChange }: PanelEditorProps) => {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useImmer<NodeGraphIcon>(initIcon)
    const onSubmit = () => {
        if (isEmpty(temp.key) || isEmpty(temp.value) || isEmpty(temp.icon)) {
            toast({
                description: "field cannot be empty",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        for (const icon of panel.settings.nodeGraph.node.icon) {
            if (icon.key == temp.key && icon.value == temp.value) {
                toast({
                    description: "the same key/value already exist",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        }

        onChange(panel => { panel.settings.nodeGraph.node.icon.unshift(temp) })
        setTemp(initIcon)
        onClose()
    }

    const removeIcon = i => {
        onChange(panel => {
            panel.settings.nodeGraph.node.icon.splice(i, 1)
        })
    }

    return (<><PanelEditItem title="icons">

        <Button size="xs" onClick={onOpen}>Add an icon</Button>
        <Divider mt="2" />
        <VStack alignItems="sleft" mt="1">
            {
                panel.settings.nodeGraph.node.icon.map((icon, i) => <Flex justifyContent="space-between" alignItems="center">
                    <HStack>
                        <Text>{icon.key} : {icon.value} -&gt;</Text>
                        <Image src={icon.icon} width="30px" height="30px" />
                    </HStack>
                    <Box layerStyle="textFourth" cursor="pointer" onClick={() => removeIcon(i)}><Icons.FaTimes /></Box>
                </Flex>)
            }
        </VStack>
    </PanelEditItem>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="700px">
                <ModalBody>
                    <HStack>
                        <Text fontWeight="600">When </Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.key = v
                            })
                        }} placeholder="attribute name, e.g: service_type" size="sm" width="250px" />
                        <Text fontWeight="600">=</Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.value = v
                            })
                        }} placeholder="attribute value, e.g: java" size="sm" width="250px" />
                    </HStack>
                    <HStack>
                        <Text fontWeight="600">show icon </Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.icon = v
                            })
                        }} placeholder="icon url" size="sm" width="250px" />
                        {/* {Icon && <Icon />} */}
                        {temp.icon && <Image src={temp.icon} width="30px" height="30px" />}
                    </HStack>
                    <Button my="4" size="sm" onClick={onSubmit}>Submit</Button>
                    <Alert status='success' flexDir="column" alignItems="left">
                        <Text>
                            1. You can find node attributes by hovering on a node, e.g 'error: 45' , 'error' is attribute name, '45' is value
                        </Text>
                        {/* <Text mt="2">
                            2. Find icons on https://react-icons.github.io/react-icons/icons?name=fa
                        </Text> */}
                    </Alert>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

const DonutColorsSetting = ({ panel, onChange }: PanelEditorProps) => {
    const toast = useToast()
    const [temp, setTemp] = useState<string>(panel.settings.nodeGraph.node.donutColors)
    const onSubmit = () => {
        if (!isJSON(temp)) {
            toast({
                description: "not valid json format",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }
        onChange(panel => {
            panel.settings.nodeGraph.node.donutColors = temp
        })
    }
    return (
        <PanelEditItem title="donut colors" info={<VStack alignItems='left' fontWeight="600">
            <Text>Map the node attributes to specify colors to draw a Donut shape</Text>
            <Text>1. json format</Text>
            <Text>2. key is the node's attribute</Text>
            <Text>3. value is a color string</Text>
            <Alert status="success">
                You can find node attributes by hovering on a node, e.g 'error: 45' , 'error' is attribute name, '45' is the value
            </Alert>
        </VStack>}>
            <Textarea value={temp} onChange={e => {
                const v = e.currentTarget.value.trim()
                setTemp(v)
            }} onBlur={onSubmit} />
        </PanelEditItem>
    )
}



const RightClickMenus = ({ panel, onChange }: PanelEditorProps) => {
    const initMenuItem = {
        name: '',
        event: 'console.log(node)'
    }

    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useImmer<NodeGraphMenuItem>(initMenuItem)

    const onSubmit = () => {
        for (const item of panel.settings.nodeGraph.node.menu) {
            if (item.name == temp.name && item.id != temp.id) {
                toast({
                    description: "same name exist",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        }

        if (!temp.id) {
            // add new menu item
            temp.id = new Date().getTime()
            onChange((panel: Panel) => {
                panel.settings.nodeGraph.node.menu.unshift(temp)
            })

        } else {
            onChange((panel: Panel) => {
                for (let i = 0; i < panel.settings.nodeGraph.node.menu.length; i++) {
                    if (panel.settings.nodeGraph.node.menu[i].id == temp.id) {
                        panel.settings.nodeGraph.node.menu[i] = temp
                    }
                }
            })

        }

        setTemp(initMenuItem)
        onClose()
    }

    const removeItem = i => {
        onChange(panel => {
            panel.settings.nodeGraph.node.menu.splice(i, 1)
        })
    }

    const moveUp = (i) => {
        onChange(panel => {
            const menu = panel.settings.nodeGraph.node.menu
            const item = menu[i - 1]
            menu[i - 1] = menu[i]
            menu[i] = item
        })
    }

    const moveDown = (i) => {
        onChange(panel => {
            const menu = panel.settings.nodeGraph.node.menu
            const item = menu[i + 1]
            menu[i + 1] = menu[i]
            menu[i] = item
        })
    }

    return (<>
        <PanelEditItem title="right click menus" >
            <Button size="xs" onClick={() => { onOpen(); setTemp(initMenuItem) }}>Add menu item</Button>
            <Divider my="2" />
            <VStack alignItems="left" pl="2">
                {
                    panel.settings.nodeGraph.node.menu.map((item, i) => <Flex alignItems="center" justifyContent="space-between">
                        <Tooltip label={item.event}><Text>{item.name}</Text></Tooltip>

                        <HStack layerStyle="textFourth">
                            {i != 0 && <Icons.FaArrowUp cursor="pointer" onClick={() => moveUp(i)} />}
                            {i != panel.settings.nodeGraph.node.menu.length - 1 && <Icons.FaArrowDown cursor="pointer" onClick={() => moveDown(i)} />}
                            <MdEdit onClick={() => { setTemp(item); onOpen() }} cursor="pointer" />
                            <Icons.FaTimes onClick={() => removeItem(i)} cursor="pointer" />
                        </HStack>
                    </Flex>)
                }
            </VStack>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="700px">
                <ModalBody>
                    <HStack>
                        <Text fontWeight="600">Menu item name </Text>
                        <Input value={temp.name} onChange={e => {
                            const v = e.currentTarget.value
                            setTemp(draft => {
                                draft.name = v
                            })
                        }} placeholder="e.g view service" size="sm" width="250px" />
                    </HStack>

                    <Text fontWeight="600" mt="4">Define click event</Text>
                    <Text>function onMenuItemClick(node, router, setVariable) &#123;</Text>
                    <Textarea value={temp.event} onChange={(e) => {
                        const v = e.currentTarget.value
                        setTemp(draft => {
                            draft.event = v
                        })
                    }}
                    />
                    <Text>&#125; </Text>

                    <Button my="4" size="sm" onClick={onSubmit}>Submit</Button>
                    <Alert status='success' flexDir="column" alignItems="left">
                        <Text>
                        </Text>
                    </Alert>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}