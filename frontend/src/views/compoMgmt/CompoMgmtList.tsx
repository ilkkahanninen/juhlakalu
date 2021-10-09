import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Compo } from "../../rust-types/Compo";

export type CompoMgmtListProps = {
  compos: Compo[];
};

const columns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "state_name", headerName: "State", width: 150 },
  { field: "description", headerName: "Description", width: 400 },
];

export const CompoMgmtList = (props: CompoMgmtListProps) => (
  <DataGrid
    rows={props.compos}
    columns={columns}
    autoHeight
    disableSelectionOnClick
  />
);
