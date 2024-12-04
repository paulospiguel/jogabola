export enum Steps {
  Step1 = 1,
  Step2 = 2,
  Step3 = 3,
}

export type StepForm<T = unknown> = {
  component: T;
  label: string;
  fields: string[];
};
