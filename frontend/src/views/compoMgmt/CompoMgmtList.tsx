import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useCallback } from "react";
import { Compo } from "../../rust-types/Compo";

export type CompoMgmtListProps = {
  compos: Compo[];
  onRowClick: (compo: Compo) => void;
};

const columns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "state_name", headerName: "State", width: 150 },
  { field: "description", headerName: "Description", width: 400 },
];

export const CompoMgmtList = (props: CompoMgmtListProps) => {
  const onRowClick = useCallback(
    (params: GridRowParams) => props.onRowClick(params.row as Compo),
    [props]
  );

  return (
    <DataGrid
      rows={props.compos}
      columns={columns}
      autoHeight
      disableSelectionOnClick
      onRowClick={onRowClick}
    />
  );
};
