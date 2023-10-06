import { TextField } from '@mui/material';

export type InputTextProps = {
  value: string;
  setValue: (newValue: string) => void;
};

export default function InputText<T>({ value, setValue }: InputTextProps) {
  return (
    <TextField
      helperText='Please enter your name'
      id='demo-helper-text-misaligned'
      label='Name'
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      }}
    />
  );
}
