import LoginIcon from "@mui/icons-material/Login";
import LoadingButton from "@mui/lab/LoadingButton";

export type FormSubmitButtonProps = {
  id?: string;
  children: string;
  disabled?: boolean;
  loading?: boolean;
};

export const FormSubmitButton = (props: FormSubmitButtonProps) => (
  <LoadingButton
    id={props.id}
    variant="contained"
    type="submit"
    loading={props.loading}
    loadingPosition="start"
    startIcon={<LoginIcon />}
    disabled={props.disabled}
  >
    {props.children}
  </LoadingButton>
);
