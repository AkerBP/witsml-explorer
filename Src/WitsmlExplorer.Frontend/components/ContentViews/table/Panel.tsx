import { EdsProvider, Tooltip, Typography } from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import { ColumnOptionsMenu } from "components/ContentViews/table/ColumnOptionsMenu";
import { Button } from "components/StyledComponents/Button";
import {
  refreshObjectQuery,
  refreshObjectsQuery,
  refreshWellboresQuery,
  refreshWellsQuery
} from "hooks/query/queryRefreshHelpers";
import useExport, { encloseCell } from "hooks/useExport";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Icon from "styles/Icons";
import { ContentTableColumn } from ".";
import { normaliseThemeForEds } from "../../../tools/themeHelpers.ts";
import { DecimalPreference } from "contexts/operationStateReducer.tsx";

export interface PanelProps {
  checkableRows: boolean;
  numberOfItems: number;
  showRefresh?: boolean;
  panelElements?: React.ReactElement[];
  numberOfCheckedItems?: number;
  table: Table<any>;
  viewId?: string;
  columns?: ContentTableColumn[];
  expandableRows?: boolean;
  stickyLeftColumns?: number;
  downloadToCsvFileName?: string;
  disableFilters?: boolean;
  disableSearchParamsFilter?: boolean;
}

const csvIgnoreColumns = ["select", "expander"]; //Ids of the columns that should be ignored when downloading as csv

const Panel = (props: PanelProps) => {
  const {
    checkableRows,
    panelElements,
    numberOfCheckedItems,
    numberOfItems,
    showRefresh,
    table,
    viewId,
    columns,
    expandableRows = false,
    downloadToCsvFileName = null,
    stickyLeftColumns,
    disableFilters = false,
    disableSearchParamsFilter = false
  } = props;
  const {
    operationState: { decimals, theme }
  } = useOperationState();
  const { exportData, exportOptions } = useExport();
  const abortRefreshControllerRef = React.useRef<AbortController>();
  const queryClient = useQueryClient();
  const { serverUrl, wellUid, wellboreUid, objectGroup, objectUid } =
    useParams();
  const firstToggleableIndex = Math.max(
    (checkableRows ? 1 : 0) + (expandableRows ? 1 : 0),
    stickyLeftColumns
  );
  const numOfSelected =
    table.getVisibleLeafColumns().length - firstToggleableIndex;
  const numOfColumns = table.getAllLeafColumns().length - firstToggleableIndex;
  const selectedColumnsStatus = `Col: ${numOfSelected}/${numOfColumns}`;
  const selectedItemsText = checkableRows
    ? `Row: ${numberOfCheckedItems}/${numberOfItems}`
    : `Items: ${numberOfItems}`;

  const decimalInfo =
    decimals !== DecimalPreference.Raw
      ? "Decimals: " + parseInt(decimals).toString()
      : "";

  useEffect(() => {
    return () => {
      abortRefreshControllerRef.current?.abort();
    };
  }, []);

  const onClickRefresh = async () => {
    if (!wellUid) {
      refreshWellsQuery(queryClient, serverUrl);
    } else if (!wellboreUid) {
      refreshWellboresQuery(queryClient, serverUrl, wellUid);
    } else if (!objectUid) {
      refreshObjectsQuery(
        queryClient,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup as ObjectType
      );
    } else {
      refreshObjectQuery(
        queryClient,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup as ObjectType,
        objectUid
      );
    }
  };

  const exportAsCsv = useCallback(() => {
    const exportColumns = table
      .getVisibleLeafColumns()
      .map((c) => c.id)
      .filter((c) => !csvIgnoreColumns.includes(c))
      .map((c) => encloseCell(c))
      .join(exportOptions.separator);
    const csvString = table
      .getRowModel()
      .rows.map((row) =>
        row
          .getVisibleCells()
          .filter((cell) => !csvIgnoreColumns.includes(cell.column.id))
          .map((cell) => cell.getValue()?.toString() || "")
          .map((value) => encloseCell(value))
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);
    exportData(downloadToCsvFileName, exportColumns, csvString);
  }, [columns, table]);

  return (
    <PanelContainer>
      <EdsProvider density={normaliseThemeForEds(theme)}>
        <Typography>{selectedItemsText}</Typography>
        <Typography>{selectedColumnsStatus}</Typography>
        <Tooltip title="Displayed decimal places can be adjusted in your settings.">
          <Typography>{decimalInfo}</Typography>
        </Tooltip>
        <ColumnOptionsMenu
          checkableRows={checkableRows}
          table={table}
          viewId={viewId}
          columns={columns}
          expandableRows={expandableRows}
          stickyLeftColumns={stickyLeftColumns}
          selectedColumnsStatus={selectedColumnsStatus}
          firstToggleableIndex={firstToggleableIndex}
          disableFilters={disableFilters}
          disableSearchParamsFilter={disableSearchParamsFilter}
        />
        {showRefresh && (
          <Button
            aria-label="refresh"
            variant="ghost_icon"
            key="refreshObjects"
            onClick={onClickRefresh}
          >
            <Icon name="refresh" />
          </Button>
        )}
        {downloadToCsvFileName != null && (
          <Button
            variant="ghost_icon"
            key="download"
            aria-label="download as csv"
            onClick={exportAsCsv}
          >
            <Icon name="download" />
          </Button>
        )}
        {panelElements}
      </EdsProvider>
    </PanelContainer>
  );
};

const PanelContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 4px;
  white-space: nowrap;
`;

export default Panel;
