import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import TaskForm from "@/components/tasks/task-form";
import TaskList from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { t, isRTL } = useLanguage();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  }) as { data: any; isLoading: boolean };

  console.log("Tasks:", tasks);

  const handleEdit = (taskData: any) => {
    setEditingTask(taskData);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {t("tasks.title")}
          </h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            data-testid="button-add-task"
          >
            <Plus className={`${isRTL ? "mr-2" : "ml-2"} w-4 h-4 text-white`} />
            {t("tasks.addNew")}
          </Button>
        </div>

        <TaskList tasks={tasks} isLoading={isLoading} onEdit={handleEdit} />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingTask ? t("tasks.edit") : t("tasks.addNew")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingTask ? t("tasks.editForm") : t("tasks.addForm")}
              </DialogDescription>
            </DialogHeader>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <TaskForm
                  task={editingTask}
                  onClose={handleFormClose}
                  onSuccess={handleFormClose}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
