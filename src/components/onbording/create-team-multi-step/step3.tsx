"use client";

import { useAction } from "next-safe-action/hooks";
import React, { useMemo, useState } from "react";
import { Control } from "react-hook-form";
import type { z } from "zod";
import { createTeamAction } from "@/actions/team";
import LanguageSelector from "@/components/language-selector";
import { PreviewLogo } from "@/components/preview-logo";
import { type teamSchema, teamShapeEnum } from "@/schemas";
import { Button } from "@/components/ui/button";

import {
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCreateTeam } from "@/context/create-team-context";
import { Switch } from "@/components/ui/switch";
import { Check, Edit, PenIcon, Trash } 
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NameSlider, Slider } from "@/components/ui/slider";
import { onCheckTeamName } from "./utils";

const TEAM_TYPES = teamShapeEnum.options;

type TeamInfoProps = {
  isMultiStep?: boolean;
  control: Control<z.infer<typeof teamSchema>>;
};

export const TeamInfo = React.forwardRef<HTMLDivElement, TeamInfoProps>(
  ({ isMultiStep, control }, ref) => {
    const [logoImage, setLogoImage] = useState<string>();
    const [isEditName, setIsEditName] = useState(false);
    const { methods: form, STORAGE_KEY } = useCreateTeam();
    const { toast } = useToast();

    const handleLogoChange = (image: string) => {
      setLogoImage(image);
      form.setValue("logo", image);
      console.log("Logo", image);
    };

    const removeLogo = () => {
      setLogoImage(undefined);
      form.setValue("logo", undefined);
    };

    const calculateRadius = (value: number[]) =>
      value?.reduce((acc, curr) => acc + curr, 0);

    const handleCheckTeamName = async (name: string) => {
      if (!name) {
        form.clearErrors("name");
        return;
      }

      const { hasError, errors } = await onCheckTeamName(name);

      if (hasError && errors) {
        form.setError("name", {
          message: Array.from(errors).join("<br />"),
        });
      } else {
        form.clearErrors("name");
      }
    };

    const createTeam = useAction(createTeamAction, {
      onError: error => {
        console.error("createTeam:", error);
        toast({
          title: "Error",
          description: "Error creating team",
          variant: "destructive",
        });
      },
    });

    const redirectTo = useMemo(() => {
      let redirectTo = "/manager/teams";

      if (isMultiStep) {
        form.reset();
        sessionStorage.removeItem(STORAGE_KEY);
      }

      return redirectTo;
    }, [isMultiStep, STORAGE_KEY]);

    return (
      <div ref={ref}>
        <div className="mt-6 grid gap-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-4">
              <div className="flex flex-col items-start">
                <FormField
                  control={control}
                  name="isPublic"
                  render={({ field, fieldState }) => (
                    <>
                      <FormItem className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isPublic"
                            defaultChecked
                            onCheckedChange={field.onChange}
                            checked={field.value}
                          />
                          <Label htmlFor="isPublic">Public</Label>
                        </div>
                        <FormDescription>
                          Public teams can be searched by everyone.
                        </FormDescription>
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col items-start">
                <FormField
                  control={control}
                  rules={{
                    required: "Email is required",
                  }}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="Email" {...field} />
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </div>
                      <FormDescription>
                        Email to send team invite and receive notifications.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="relative flex h-[12rem] w-[12rem] items-center justify-center space-y-2 rounded-lg border">
              <FormField
                control={control}
                name="logo"
                render={({ field }) => (
                  <>
                    <PreviewLogo
                      updateImage={handleLogoChange}
                      image={logoImage}
                    />
                  </>
                )}
              />
              {logoImage && (
                <Button
                  className="absolute right-1 top-1"
                  variant="ghost"
                  type="button"
                  onClick={removeLogo}
                >
                  <Trash className="h-5 w-5 text-gray-500" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <>
                  <FormItem className="flex-1">
                    <Label htmlFor="teamName">Nome da equipa</Label>

                    <div className="relative">
                      <Input
                        {...field}
                        disabled={!!field.value && !isEditName && !isMultiStep}
                        className="z-10 pr-40"
                        isError={!!fieldState.error?.message}
                        placeholder="Equipa de sucesso chama-se..."
                        onBlur={() => handleCheckTeamName(field.value)}
                      />

                      <button
                        type="button"
                        className="group absolute inset-y-0 right-0 z-50 flex items-center pr-3"
                        onClick={() => {
                          setIsEditName(!isEditName);
                        }}
                      >
                        {isEditName ? (
                          <Check className="h-5 w-5 group-hover:text-green-500" />
                        ) : (
                          <Edit className="h-5 w-5 group-hover:text-gray-500" />
                        )}
                      </button>
                    </div>

                    <FormMessage />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <LanguageSelector
                    currentLang={field.value}
                    onLanguageChange={field.onChange}
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <FormField
              control={control}
              name="bio"
              render={({ field }) => (
                <Textarea {...field} placeholder="Qual o lema de sua equipa" />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Localização</Label>
              <FormField
                control={control}
                name="location"
                render={({ field }) => (
                  <Input placeholder="Ex: Lisboa" {...field} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamShape">Formação</Label>
              <FormField
                control={control}
                name="teamShape"
                render={({ field }) => (
                  <Select
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_TYPES?.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <FormField
              control={control}
              name="radiusPlayerArea"
              render={({ field }) => {
                const [min, max] = field?.value || [];
                return (
                  <FormItem className="w-full">
                    <Label htmlFor="radiusPlayerArea">
                      Raio de localização
                      <span className="text-xs text-gray-500">
                        ({calculateRadius(field?.value)}km)
                      </span>
                    </Label>
                    <Slider
                      showFirstTrack={false}
                      step={1}
                      defaultValue={field?.value}
                      onValueChange={value => {
                        value[NameSlider.MIN] = 1;
                        field.onChange(value);
                      }}
                    />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="radiusPlayerAge"
              render={({ field }) => {
                const [min, max] = field?.value || [];
                return (
                  <FormItem className="w-full">
                    <Label htmlFor="radiusPlayerAge">
                      Intervalo de idade{" "}
                      <span className="text-xs text-gray-500">
                        ({`${min} - ${max}`} anos)
                      </span>
                    </Label>
                    <Slider
                      min={15}
                      minStepsBetweenThumbs={1}
                      defaultValue={field?.value}
                      showFirstTrack={true}
                      onValueChange={value => {
                        field.onChange(value);
                      }}
                    />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        <FormMessage />
      </div>
    );
  },
);
