export enum Steps {
  Step1 = 1,
  Step2 = 2,
  Step3 = 3,
}

export type StepForm = {
  label: string;
  component: React.FC;
  fields: string[];
};
