"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { teamSchema } from "@/schemas";
import type { Steps } from "@/types";
import type { z } from "zod";

import { checkUserHasTeam } from "@/actions/team";
import { useRouter } from "next/navigation";

import type { UseFormPersistReturn } from "@/hooks/use-form-persist";
import { teamStore } from "@/store/team.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@tanstack/react-store";
import { useForm } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { Props } from "recharts/types/container/Surface";
import { log } from "console";

type CreateTeamContextValue = {
  isPending: boolean;
  error: string;
  success: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  data: z.infer<typeof teamSchema>;
  setTeamData: (value: z.infer<typeof teamSchema>) => void;
  goToStep: (step: Steps) => void;
  currentStep: Steps;
  isCompleted?: boolean;
  STORAGE_KEY: string;
  methods: UseFormPersistReturn<z.infer<typeof teamSchema>>;
  createdTeamCounter: number;
  isClient: boolean;
};

const initialData = {
  name: "",
  bio: undefined,
  logo: undefined,
  ...teamSchema
    .pick({
      currentStep: true,
      location: true,
      language: true,
      teamShape: true,
      radiusPlayerArea: true,
      radiusPlayerAge: true,
      isPublic: true,
    })
    .parse({}),
} as z.infer<typeof teamSchema>;

const CreateTeamContext = createContext<CreateTeamContextValue | undefined>(
  undefined,
);

type CreateTeamProviderProps = PropsWithChildren<{}>;

export const CreateTeamProvider: React.FC<CreateTeamProviderProps> = ({
  children,
}) => {
  const { data: session } = useSession();
  const STORAGE_KEY = `jogabolaCreateTeam:${session?.user?.id}`;
  const [isPending, setIsPending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teamData, setCurrentTeamData] =
    useState<z.infer<typeof teamSchema>>(initialData);

  const { createdTeamCounter } = useStore(teamStore);

  // const methods = useFormPersist<z.infer<typeof teamSchema>>({
  // 	storageKey: keyStorage,
  // 	storageLocation: window ? window?.sessionStorage : undefined,
  // 	resolver: zodResolver(teamSchema),
  // 	includeDirtyFields: true,
  // 	defaultValues: teamData,
  // 	callback(values, isSubmitting, isSubmitted) {
  // 		if (isSubmitted) {
  // 			setIsCompleted(isSubmitted);
  // 		}
  // 	},
  // });

  const methods = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: teamData,
  });

  const { push } = useRouter();

  const setTeamData = (value: z.infer<typeof teamSchema>) => {
    setCurrentTeamData(value);
  };

  const goToStep = (step: Steps) => {
    methods.setValue("currentStep", step);
    setCurrentTeamData(prevState => ({ ...prevState, currentStep: step }));
  };

  useAction(checkUserHasTeam, {
    executeOnMount: {
      input: {
        userId: session?.user?.id as string,
      },
    },
    onSuccess: ({ data: hasRolesTeam }) => {
      if (hasRolesTeam) {
        console.log({ hasRolesTeam });

        // push("/manager/teams");
        return;
      }
    },
  });

  useEffect(() => {
    setIsClient(true);
    const storedData = sessionStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setCurrentTeamData(parsedData);
      methods.reset(parsedData);
    }
  }, [methods]);

  useEffect(() => {
    const subscription = methods.watch(value => {
      if (isClient) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, isClient]);

  const value: CreateTeamContextValue = {
    isPending,
    error,
    success,
    setError,
    setSuccess,
    data: teamData,
    setTeamData,
    goToStep,
    currentStep: teamData?.currentStep,
    isCompleted,
    STORAGE_KEY,
    methods,
    createdTeamCounter,
    isClient,
  };

  return (
    <CreateTeamContext.Provider value={value}>
      {children}
    </CreateTeamContext.Provider>
  );
};

export const useCreateTeam = () => {
  const context = useContext(CreateTeamContext);

  if (!context) {
    throw new Error(
      "useCreateTeamContext must be used within a CreateTeamProvider",
    );
  }
  return context;
};
