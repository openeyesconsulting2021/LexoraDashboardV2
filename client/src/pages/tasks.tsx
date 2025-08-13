import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TaskForm from "@/components/tasks/task-form";
import TaskList from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  }) as { data: any; isLoading: boolean };

  const handleEdit = (taskData: any) => {
    setEditingTask(taskData);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">إدارة المهام</h1>
            <Button onClick={() => setShowForm(true)} data-testid="button-add-task">
              <Plus className="ml-2 w-4 h-4" />
              إضافة مهمة جديدة
            </Button>
          </div>

          {showForm ? (
            <TaskForm 
              task={editingTask} 
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          ) : (
            <TaskList 
              tasks={tasks} 
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
