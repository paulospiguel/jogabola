"use client";

import React from "react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

import {
  Award,
  Check,
  Plus,
  PlusIcon,
  Save,
  Trash,
  Users,
} 
import AddNewCompetition from "../add-competition";
import { useState, useTransition } from "react";

import noImage from "@/assets/images/JOGABOLA-shield.svg";
import { useTranslations } from "next-intl";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Divider } from "@/components/ui/divider";
import { id, se } from "date-fns/locale";

const competitionsType = ["league", "cup", "championship"];
const modality = ["fut11", "fut7", "fut5"];

const additionalInfoSchema = z.object({
  label: z.string().default(""),
  value: z.string().default(""),
  isSaved: z.boolean().optional(),
});

const competitionSchema = z.object({
  id: z.number().optional(),
  competitionName: z.string(),
  image: z.string().optional(),
  status: z.string().optional().default("active"),
  stage: z.string().optional(),
  season: z.string().optional(),
  type: z.string(),
  startDate: z.string(),
  rank: z.number().optional(),
  points: z.number().optional(),
  additionalInfo: z.record(z.string(), additionalInfoSchema).optional(),
});

interface CompetitionsTabProps {
  hasEditPermission: boolean;
  session: Session | null;
}

const STATUS = z.enum(["active", "disabled"]);

const initialCompetitions = [
  {
    id: 1,
    competitionName: "Copa Galo Fut 11",
    image: noImage,
    type: "cup",
    status: STATUS.Enum.disabled,
    stage: "fished",
    startDate: new Date().toISOString().split("T")[0],
    season: "2023/2024",
    additionalInfo: {},
  },
  {
    id: 2,
    competitionName: "Copa Galo Fut 5",
    image: noImage,
    type: "cup",
    status: STATUS.Enum.disabled,
    stage: "group",
    season: "2024",
    points: 45,
    startDate: new Date().toISOString().split("T")[0],
    additionalInfo: {},
  },
  {
    id: 3,
    competitionName: "Ligue de Futebol 11",
    image: noImage,
    rank: 4,
    type: "league",
    status: STATUS.Enum.active,
    stage: "ongoing",
    season: "2024/2025",
    points: 45,
    startDate: new Date().toISOString().split("T")[0],
    additionalInfo: {},
  },
];

export default function CompetitionsTab({
  hasEditPermission,
  session,
}: CompetitionsTabProps) {
  const [competitions, setCompetitions] =
    useState<z.infer<typeof competitionSchema>[]>(initialCompetitions);
  const [isCopetitionModalOpen, setIsCopetitionModalOpen] = useState(false);
  const [isLoading, setTransition] = useTransition();
  const [additionalInfoFields, setAdditionalInfoFields] = useState<
    z.infer<(typeof competitionSchema.shape)["additionalInfo"]>
  >({});

  const t = useTranslations();

  const { register, handleSubmit, control, reset } = useForm<
    z.infer<typeof competitionSchema>
  >({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      additionalInfo: {},
    },
  });
  const handleAddAdditionalInfo = (id: number) => {
    setAdditionalInfoFields({
      ...additionalInfoFields,
      [id]: {
        label: "",
        value: "",
      },
    });
  };

  const handleDeleteAdditionalInfo = (id: string) => {
    const currentFields = additionalInfoFields;
    delete currentFields[id];
    setAdditionalInfoFields(() => ({ ...currentFields }));
  };

  const handleSaveAdditionalInfo = (id: string) => {
    const existingField = additionalInfoFields?.[id];

    if (!existingField) {
      return;
    }

    if (!existingField.label || !existingField.value) {
      return;
    }

    existingField.isSaved = true;

    setAdditionalInfoFields(prevState => ({
      ...prevState,
      [id]: existingField,
    }));
  };

  const onCloseAddCompetitionModal = () => {
    setIsCopetitionModalOpen(false);
    reset();
  };

  const handleUpdateAdditionalField = (
    id: string,
    label: string,
    value: string,
  ) => {
    const existingField = additionalInfoFields?.[id];

    if (!existingField) {
      return;
    }

    existingField.label = label || "";
    existingField.value = value || "";
    existingField.isSaved = false;

    setAdditionalInfoFields(prevState => ({
      ...prevState,
      [id]: existingField,
    }));
  };

  const handleSaveCompetition = (
    formData: z.infer<typeof competitionSchema>,
  ) => {
    console.log(formData);

    setTransition(() => {
      new Promise(resolve => {
        setTimeout(() => {
          const newCompetition = {
            id: Date.now(),
            competitionName: formData.competitionName,
            image: formData.image,
            type: formData.type,
            status: formData.status,
            startDate: formData.startDate,
            additionalInfo: additionalInfoFields,
          };
          console.log(newCompetition);

          setCompetitions([...competitions, newCompetition]);
          setIsCopetitionModalOpen(false);
          reset();
          resolve(true);
        }, 1000);
      });
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center font-sans text-2xl">
            <Award className="mr-2 h-6 w-6 text-primary" />
            {t("tabs.competitions.title")}
          </CardTitle>
          {hasEditPermission && (
            <Button
              onClick={() => setIsCopetitionModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />{" "}
              {t("tabs.competitions.addCompetition")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {competitions.map(competition => (
              <li
                key={competition.id}
                className="flex gap-4 rounded-lg border bg-gray-50 p-4"
              >
                <div>
                  <Image
                    className="object-cover"
                    src={competition?.image || noImage}
                    alt={competition?.competitionName}
                    width={60}
                    height={60}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {competition.competitionName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(`tabs.competitions.${competition.type}`)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {competition?.startDate}
                  </p>
                  {competition.rank && (
                    <p>
                      {t("tabs.competitions.position")}: {competition.rank}º
                    </p>
                  )}
                  {competition.points && (
                    <p>
                      {t("tabs.competitions.points")}: {competition.points}
                    </p>
                  )}
                  {competition.stage && (
                    <p>
                      {t("tabs.competitions.stage")}:{" "}
                      {t(`tabs.competitions.${competition.stage}`)}
                    </p>
                  )}

                  {Object?.entries(competition?.additionalInfo)?.map(
                    ([key, value]) => (
                      <div key={key} className="flex">
                        <span className="mr-1 text-sm font-bold text-gray-600">
                          {value.label}:
                        </span>
                        <span className="text-sm text-gray-600">
                          {value.value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Button
        onClick={() => setIsCopetitionModalOpen(true)}
        className="fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-primary p-4 text-white shadow-lg transition-colors duration-200 hover:bg-green-700"
      >
        <Users className="mr-2 h-6 w-6" />
        {t("tabs.competitions.makeConvocation")}
      </Button>

      <Dialog
        open={isCopetitionModalOpen}
        onOpenChange={onCloseAddCompetitionModal}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{t("tabs.competitions.addCompetition")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveCompetition)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="competitionName" className="text-right">
                  {t("tabs.competitions.competitionName")}
                </Label>
                <Input
                  {...register("competitionName")}
                  placeholder={t("tabs.competitions.competitionName")}
                  id="competitionName"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-right">
                    {t("tabs.competitions.type")}
                  </Label>
                  <FormField
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("tabs.competitions.type")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {competitionsType.map(item => (
                            <SelectItem key={item} value={item}>
                              {t(`tabs.competitions.${item}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-right">
                    {t("tabs.competitions.modality")}
                  </Label>
                  <FormField
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("tabs.competitions.modality")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {modality.map(item => (
                            <SelectItem key={item} value={item}>
                              {t(`tabs.competitions.${item}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-right">
                    {t("tabs.competitions.startDate")}
                  </Label>
                  <Input
                    {...register("startDate")}
                    type="date"
                    placeholder={t("tabs.competitions.startDate")}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div>
                <Divider text="Informações adicionais" />

                <Button
                  disabled={Object.values(additionalInfoFields || {})?.some(
                    field => !field.isSaved,
                  )}
                  variant="outline"
                  className="my-2 w-full"
                  onClick={() => handleAddAdditionalInfo(Date.now())}
                >
                  <Plus className="mr-2 h-4 w-4" />{" "}
                  {t("tabs.competitions.additionalInfo")}
                </Button>

                <>
                  {Object.entries(additionalInfoFields || {})?.map(
                    ([id, field]) => (
                      <div key={id} className="mb-2 grid grid-cols-5 gap-2">
                        <Input
                          disabled={field.isSaved}
                          id={field.label}
                          defaultValue={field.label}
                          type="text"
                          className="col-span-2"
                          placeholder={t("global.label")}
                          onChange={e =>
                            handleUpdateAdditionalField(
                              id,
                              e.target.value,
                              field.value,
                            )
                          }
                        />
                        <Input
                          disabled={field.isSaved}
                          id={field.value}
                          defaultValue={field.value}
                          type="text"
                          className="col-span-2"
                          placeholder={t("global.value")}
                          onChange={e =>
                            handleUpdateAdditionalField(
                              id,
                              field.label,
                              e.target.value,
                            )
                          }
                        />
                        {!additionalInfoFields?.[id]?.isSaved && (
                          <Button
                            className="col-span-1"
                            variant="default"
                            onClick={() => handleSaveAdditionalInfo(id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {additionalInfoFields?.[id]?.isSaved && (
                          <Button
                            className="col-span-1"
                            variant="destructive"
                            onClick={() => handleDeleteAdditionalInfo(id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ),
                  )}
                </>
              </div>
            </div>
            <DialogFooter className="flex justify-end">
              <Button>
                <Save className="mr-1 h-4 w-4" /> {t("global.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
