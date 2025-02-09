"use client";

import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useMemo } from "react";
import { type SubmitHandler, useFormContext } from "react-hook-form";
import type { z } from "zod";

import { checkTeamByName, createTeamAction } from "@/actions/team";
import { LanguageToggle } from "@/components/language-selector";
import { PreviewLogo } from "@/components/preview-logo";
import { useCreateTeam } from "@/hooks/use-create-team";
import { type teamSchema, teamShapeEnum } from "@/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NameSlider, Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Trash } 
import { Switch } from "@/components/ui/switch";

const TEAM_TYPES = teamShapeEnum.options;

type Team = z.infer<typeof teamSchema>;

type Step3Props = {
  isMultiStep?: boolean;
};

export const Step3 = React.forwardRef<HTMLFormElement, Step3Props>(
  ({ isMultiStep }, ref) => {
    const [logoImage, setLogoImage] = React.useState<string>();
    const form = useFormContext<Team>();
    const { toast } = useToast();
    const { keyStorage } = useCreateTeam();

    const handleLogoChange = (image: string) => {
      setLogoImage(image);
      form.setValue("logo", image);
      console.log("Logo", image);
    };

    const removeLogo = () => {
      setLogoImage(undefined);
      form.setValue("logo", undefined);
    };

    const calculateRadius = (value: number[]) => {
      return value?.reduce((acc, curr) => acc + curr, 0);
    };

    const onSubmit: SubmitHandler<
      z.infer<typeof teamSchema>
    > = async values => {
      createTeam.execute({ values, redirectTo: redirectTo });
    };

    const handelCheckTeamName = async (teamName: string) => {
      const response = await checkTeamByName({ teamName });
      if (response?.validationErrors) {
        form.setError("name", { message: "Team name already exists!" });
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
        sessionStorage.removeItem(keyStorage);

        redirectTo = "/manager/teams";
      }

      return redirectTo;
    }, [isMultiStep, form, keyStorage]);

    return (
      <Form {...form}>
        <form ref={ref} onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Create Your Team</CardTitle>
              <CardDescription>
                Fill out the form to build your dream team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col items-start">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        rules={{
                          required: "Email is required",
                        }}
                        name="email"
                        render={({ field, fieldState }) => (
                          <>
                            <FormItem className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  placeholder="Email"
                                  {...field}
                                />
                                <FormMessage>
                                  {fieldState.error?.message}
                                </FormMessage>
                              </div>
                              <FormDescription>
                                Email to send team invite and receive
                                notifications.
                              </FormDescription>
                            </FormItem>
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div className="relative flex h-[12rem] w-[12rem] items-center justify-center space-y-2 rounded-lg border">
                    <FormField
                      control={form.control}
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
                        <Trash className="h-6 w-6 text-gray-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-end space-x-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <>
                        <FormItem className="flex-1">
                          <Label htmlFor="teamName">Nome da equipa</Label>
                          <Input
                            {...field}
                            //disabled={!!field.value}
                            isError={!!fieldState.error?.message}
                            placeholder="Equipa de sucesso chama-se..."
                            onBlur={() => handelCheckTeamName(field.value)}
                          />
                          <FormMessage />
                        </FormItem>
                      </>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <LanguageToggle
                          value={field.value}
                          onChangeValue={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <Textarea
                        placeholder="Qual o lema de sua equipa"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Localização</Label>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <Input placeholder="Ex: Lisboa" {...field} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamShape">Formação</Label>
                    <FormField
                      control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                data-loading={String(form.formState.isSubmitting)}
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
                className="cursor-hand w-full dark:text-white"
              >
                Criar equipa
              </Button>
            </CardFooter>
          </Card>
        </form>
        <FormMessage />
      </Form>
    );
  },
);
