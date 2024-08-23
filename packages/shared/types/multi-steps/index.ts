export enum Steps {
  Step1 = 1,
  Step2 = 2,
  Step3 = 3,
}

export type StepForm<T = unknown> = {
  label: string;
  component: T
  fields: string[];
};
