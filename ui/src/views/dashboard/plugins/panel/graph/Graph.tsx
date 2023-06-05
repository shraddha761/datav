import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { Panel, PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { DataFrame } from "types/dataFrame";
import { cloneDeep, isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import SeriesTable, { seriesFilterType } from "components/Tooltip/SeriesTable";
import { GraphLayout } from "layouts/plugins/GraphLayout";
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import { colors } from "utils/colors";
import { parseLegendFormat } from "utils/format";
import { replaceWithVariables } from "utils/variable";
import { variables } from "src/views/dashboard/Dashboard";




const GraphPanel = memo((props: PanelProps) => {
    const {colorMode} = useColorMode()
    const [options, data] = useMemo(() => {
        let o;
        let d;
        // transform series name based on legend format 
        for (const ds of props.panel.datasource) {
            if (ds.selected) {
                for (const query of ds.queries) {
                    if (!isEmpty(query.legend)) {
                        const formats = parseLegendFormat(query.legend)
                        props.data.map(frame => {
                            if (frame.id == query.id) {
                                frame.name = query.legend
                                if (!isEmpty(formats)) {
                                    for (const format of formats) {
                                        const l = frame.fields[1].labels[format]
                                        if (l) {
                                            frame.name = frame.name.replaceAll(`{{${format}}}`, l)
                                        }
                                    }
                                }

                                // replace ${xxx} format with corresponding variables
                                frame.name = replaceWithVariables(frame.name, variables)
                            }
                        })
                    }
                }
            }

            // set series line color
            props.data.map((frame, i) => frame.color = colors[i % colors.length])

            o = parseOptions(props, colorMode)
        }

        d = transformDataToUplot(props.data)
        return [o, d]
    }, [props.panel,props.data, colorMode])


    const [uplot, setUplot] = useState<uPlot>(null)


    const onSelectSeries = (s) => {
        props.panel.settings.graph.activeSeries = props.panel.settings.graph.activeSeries == s ? null : s

        // setConfig(cloneDeep(props))
    }

    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props])

    // console.log("panel plugin rendered",config)
    console.log("here1111112: ", options,data)
    return (
        <>
            <Box>
                {!isEmpty(props?.panel.settings.graph.axis?.label) && <Text fontSize="sm" position="absolute" ml="3" mt="-1" className="color-text">{props.panel.settings.graph.axis.label}</Text>}
                {options && <GraphLayout width={props.width} height={props.height} legend={props.panel.settings.graph.legend.mode == "hidden" ? null : <SeriesTable placement={props.panel.settings.graph.legend.placement} props={props} filterType={seriesFilterType.Current} onSelect={onSelectSeries} />}>
                    {(vizWidth: number, vizHeight: number) => {
                        if (uplot) {
                            if (props.width != vizWidth || props.height != vizHeight) {
                                uplot.setSize({ width: vizWidth, height: vizHeight })
                            }
                        }

                        // console.log(options)
                        return (options && <UplotReact
                            options={options}
                            data={data}
                            onDelete={(chart: uPlot) => { }}
                            onCreate={onChartCreate}
                        >
                            {props.panel.settings.graph.tooltip.mode != 'hidden' && <Tooltip props={props} options={options} />}
                        </UplotReact>
                        )
                    }}



                </GraphLayout>}
            </Box>
        </>
    )
})

export default GraphPanel


// transform Dataframes to uplot data
const transformDataToUplot = (data: DataFrame[]) => {
    const transformed = []

    // push x-axes data first
    if (isEmpty(data)) {
        return []
    }

    const xField = data[0].fields[0]
    transformed.push(xField.values)

    // push y-axes series data
    for (const d of data) {
        transformed.push(d.fields[1].values)
    }

    return transformed
}