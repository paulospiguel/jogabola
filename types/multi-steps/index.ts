export enum Steps {
  Step1 = 1,
  Step2 = 2,
}

export type StepForm = {
  label: string;
  component: React.FC;
  fields: string[];
};
