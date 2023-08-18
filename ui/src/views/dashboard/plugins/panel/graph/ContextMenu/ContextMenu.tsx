import { Box, Button, Divider, HStack, Portal, StackDivider, Text, VStack, useOutsideClick } from "@chakra-ui/react";
import { TooltipContainer } from "../Tooltip/Tooltip";
import React, { memo, useLayoutEffect, useRef, useState } from "react";
import { PanelProps } from "types/dashboard";
import { SeriesData } from "types/seriesData";
import { isEmpty } from "utils/validate";
import { findOverride, findRuleInOverride } from "utils/dashboard/panel";
import { GraphRules } from "../OverridesEditor";
import { findNearestSeriesAndDataPoint } from "../Tooltip";
import { dispatch } from "use-bus";
import { OnGraphPanelClickEvent } from "src/data/bus-events";
import { dateTimeFormat } from "utils/datetime/formatter";
import AnnotationEditor from "../../../../../Annotation/AnnotationEditor";
import { Annotation } from "types/annotation";
import { roundDsTime } from "utils/datasource";

interface Props {
    props: PanelProps
    options: uPlot.Options
    data: SeriesData[]
    container
}

const ContextMenu = memo(({ props, options, data, container }: Props) => {
    const [annotation, setAnnotation] = useState<Annotation>(null)
    const [coords, setCoords] = useState(null);

    const plotInstance = useRef<uPlot>();

    const dataIdx = useRef(null)
    const seriesIdx = useRef<SeriesData>(null)
    const coordX = useRef(null)
    const coordY = useRef(null)
    const xVal = useRef(null)
    // useOutsideClick({
    //     ref: container,
    //     handler: () => setCoords(null)
    //   })

    useLayoutEffect(() => {
        let bbox: DOMRect | undefined = undefined;

        options.hooks.init.push((u) => {
            plotInstance.current = u;
          });
      

        if (options) {
            options.hooks.syncRect.push((u, rect) => (bbox = rect))
            const setcusor = (uplot) => {
                if (!uplot || !bbox) {
                    return
                }

                let c = uplot.cursor;

                if (dataIdx.current != c.idx) {
                    dataIdx.current = c.idx;
                }

                const r = findNearestSeriesAndDataPoint(uplot, bbox, data, props.panel)
                if (r) {
                    const [fs, xv, x, y] = r
                    seriesIdx.current = fs
                   
                    coordX.current = x
                    coordY.current = y
                }
                xVal.current = uplot.cursor.left

            }

            // const setSeries = (u, sidx) => {
            //     console.log("here33333 set series", sidx)
            //     if (seriesIdx.current != sidx) {
            //         seriesIdx.current = sidx;
            //     }
            // }

            options.hooks.setCursor?.push(setcusor)
            options.hooks.ready?.push(
                u => {
                    const over = u.over;


                    let clientX;
                    let clientY;

                    over.addEventListener("mousedown", e => {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    });

                    over.addEventListener("mouseup", e => {
                        // clicked in-place
                        if (e.clientX == clientX && e.clientY == clientY) {
                            if (seriesIdx.current != null && dataIdx.current != null) {
                                setCoords(cd => cd ? null : { x: coordX.current, y: coordY.current })
                                dispatch(OnGraphPanelClickEvent + props.panel.id)
                            }
                        } else {
                            setCoords(null)
                        }
                    });
                }
            )
        }

        return () => { }
    }, [options])

    const onAddAnnotation = (ts) => {
        setAnnotation({
            color: "rgba(0, 211, 255, 1)",
            time: ts,
            timeEnd: ts,
            text: "",
            tags: [],
            id: 0,
            group: props.panel.id,
            namespace: props.dashboardId,
        })
    }

    const startTime = roundDsTime(plotInstance.current?.posToVal(xVal.current,'x'))
    return (<>
        <Portal key={props.panel.id}>
            {coords && <TooltipContainer allowPointerEvents position={{ x: coords.x, y: coords.y }} offset={{ x: -8, y: 2 }}>
                <Box className="bordered" background={'var(--chakra-colors-chakra-body-bg)'} p="2" fontSize="xs">
                    <Text fontWeight="600">{dateTimeFormat(startTime * 1000)}</Text>
                    <HStack mt="1">
                        <Box width="10px" height="4px" background={seriesIdx.current.color} mt="2px"></Box>
                        <Text>{seriesIdx.current.name}</Text>
                    </HStack>
                    <Divider mt="2" />
                    <VStack alignItems={"left"} mt="2" divider={<StackDivider />}>
                        <Button size="sm" variant="ghost" onClick={() => onAddAnnotation(startTime)}>Add annotation</Button>
                    </VStack>
                </Box>
            </TooltipContainer>
            }

            {annotation && <AnnotationEditor annotation={annotation} onEditorClose={() => {
                setAnnotation(null)
                // plotInstance.current.setSelect({ top: 0, left: 0, width: 0, height: 0 });
                }}/>}
        </Portal>
    </>)
})

export default ContextMenu