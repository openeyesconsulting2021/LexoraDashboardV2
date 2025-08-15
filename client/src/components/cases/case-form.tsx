import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCaseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/language-context";

interface CaseFormProps {
  case?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CaseForm({
  case: editCase,
  onClose,
  onSuccess,
}: CaseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isRTL } = useLanguage();
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any[] | undefined };

  const { data: lawyers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () =>
      fetch("/api/users")
        .then((res) => res.json())
        .then((users) =>
          users.filter((u: any) => u.role === "lawyer" || u.role === "admin")
        ),
  });
  const caseFormSchema = insertCaseSchema.extend({
    caseNumber: z.string().min(1, t("caseForm.caseNumber" as any)),
    title: z.string().min(1, t("caseForm.title" as any)),
    caseType: z.string().min(1, t("caseForm.caseType" as any)),
    clientId: z.string().min(1, t("caseForm.clientId" as any)),
    assignedLawyerId: z.string().min(1, t("caseForm.assignedLawyerId" as any)),
  });

  const form = useForm({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      caseNumber: editCase?.caseNumber || "",
      title: editCase?.title || "",
      description: editCase?.description || "",
      status: editCase?.status || "active",
      priority: editCase?.priority || "medium",
      caseType: editCase?.caseType || "",
      court: editCase?.court || "",
      judge: editCase?.judge || "",
      opposingParty: editCase?.opposingParty || "",
      clientId: editCase?.clientId || "",
      assignedLawyerId: editCase?.assignedLawyerId || "",
      createdBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof caseFormSchema>) => {
      const res = await apiRequest("POST", "/api/cases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: t("cases.createSuccess") });
      onSuccess();
    },
    onError: () => {
      toast({ title: t("cases.createError"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof caseFormSchema>) => {
      const res = await apiRequest("PUT", `/api/cases/${editCase.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: t("cases.updateSuccess") });
      onSuccess();
    },
    onError: () => {
      toast({ title: t("cases.updateError"), variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof caseFormSchema>) => {
    if (editCase) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.caseNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="C-2024-001"
                      {...field}
                      data-testid="input-case-number"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.client")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="select-client"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      >
                        <SelectValue
                          placeholder={t("cases.selectClientPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {clients?.map((client: any) => (
                        <SelectItem
                          key={client.id}
                          value={client.id}
                          className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cases.caseTitle")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("cases.caseTitle")}
                    {...field}
                    data-testid="input-case-title"
                    className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel> {t("cases.caseShortDescription")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("cases.caseDetailedDescription")}
                    rows={3}
                    {...field}
                    data-testid="textarea-case-description"
                    className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="caseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> {t("cases.caseType")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cases.caseTypePlaceholder")}
                      {...field}
                      data-testid="input-case-type"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="select-status"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem
                        value="active"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.statuses.active")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="pending"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.statuses.pending")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="closed"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.statuses.closed")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="archived"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.statuses.archived")}{" "}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> {t("cases.priority")} </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="select-priority"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem
                        value="low"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.priorities.low")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.priorities.medium")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="high"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.priorities.high")}{" "}
                      </SelectItem>
                      <SelectItem
                        value="urgent"
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {t("cases.priorities.urgent")}{" "}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="assignedLawyerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.assignedLawyer")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        data-testid="select-lawyer"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      >
                        <SelectValue
                          placeholder={t("cases.selectLawyerPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {lawyers?.map((lawyer: any) => (
                        <SelectItem
                          key={lawyer.id}
                          value={lawyer.id}
                          className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                        >
                          {lawyer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="court"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.court")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cases.exemplecourt")}
                      {...field}
                      data-testid="input-court"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="judge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cases.judge.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cases.judge.placeholder")}
                      {...field}
                      data-testid="input-judge"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opposingParty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> {t("cases.opponent.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cases.opponent.placeholder")}
                      {...field}
                      data-testid="input-opposing-party"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button
              type="button"
              onClick={onClose}
              data-testid="button-cancel"
              className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-lg"
            >
              {t("common.close")}{" "}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-save-case"
              className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                  {t("cases.buttons.saving")}{" "}
                </>
              ) : editCase ? (
                t("cases.buttons.updateCase")
              ) : (
                t("cases.buttons.createCase")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
