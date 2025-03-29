import { rc } from "@recommand/lib/client";
import type { Task, Tasks } from "api/tasks";
import { useState, useEffect } from "react";
import { useParams } from "@core/lib/react-router";
import { Input } from "@core/components/ui/input";
import { Button } from "@core/components/ui/button";
import { toast } from "@core/components/ui/sonner";
import { stringifyActionFailure } from "@recommand/lib/utils";
const client = rc<Tasks>('todo-app');

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id || "";

    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    useEffect(() => {
        fetchTask();
    }, [taskId]);

    const fetchTask = async () => {
        if (!taskId) {
            setError("Invalid task ID");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await client.tasks[':id'].$get({
                param: { id: taskId }
            });

            const json = await res.json();
            if (json.success) {
                setTask(json.task);
                setEditTitle(json.task.title || "");
                setEditDescription(json.task.description || "");
            } else {
                setError("Failed to load task");
                toast.error(stringifyActionFailure(json.errors));
            }
        } catch (err) {
            setError("Error fetching task");
            toast.error("Error fetching task");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTaskStatus = async () => {
        if (!task) return;

        try {
            const res = await client.tasks[':id'].$put({
                param: { id: taskId },
                json: {
                    completed: !task.completed
                }
            });

            const json = await res.json();
            if (json.success) {
                setTask(json.task);
                toast.success("Task status updated successfully");
            }else{
                toast.error(stringifyActionFailure(json.errors));
            }
        } catch (err) {
            toast.error("Error updating task status");
        }
    };

    const saveTaskChanges = async () => {
        if (!task) return;

        try {
            const res = await client.tasks[':id'].$put({
                param: { id: taskId },
                json: {
                    title: editTitle,
                    description: editDescription
                }
            });

            const json = await res.json();
            if (json.success) {
                setTask(json.task);
                setIsEditing(false);
                toast.success("Task updated successfully");
            }else{
                toast.error(stringifyActionFailure(json.errors));
            }
        } catch (err) {
            toast.error("Error updating task");
        }
    };

    const deleteTask = async () => {
        if (!task) return;

        if (confirm("Are you sure you want to delete this task?")) {
            try {
                const res = await client.tasks[':id'].$delete({
                    param: { id: taskId }
                });

                const json = await res.json();
                if (json.success) {
                    toast.success("Task deleted successfully");
                    window.location.href = "/tasks";
                }else{
                    toast.error(stringifyActionFailure(json.errors));
                }
            } catch (err) {
                toast.error("Error deleting task");
            }
        }
    };

    const goBack = () => {
        window.location.href = "/tasks";
    };

    if (isLoading) return <div className="flex justify-center p-10">Loading task...</div>;
    if (error) return <div className="text-red-500 p-10">{error}</div>;
    if (!task) return <div className="p-10">Task not found</div>;

    return (
        <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={goBack}
                    className="text-gray-500"
                >
                    ← Back to Tasks
                </Button>
                <div className="flex gap-2">
                    {!isEditing && (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={deleteTask}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveTaskChanges}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="task-completed"
                            checked={task.completed}
                            onChange={toggleTaskStatus}
                            className="h-4 w-4"
                        />
                        <label
                            htmlFor="task-completed"
                            className={`text-2xl font-bold ${task.completed ? 'line-through text-gray-500' : ''}`}
                        >
                            {task.title}
                        </label>
                    </div>

                    {task.description && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                            <p className={`text-gray-800 ${task.completed ? 'text-gray-500' : ''}`}>
                                {task.description}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between text-sm text-gray-500">
                            <div>
                                Status: <span className={task.completed ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                                    {task.completed ? 'Completed' : 'Active'}
                                </span>
                            </div>
                            <div>
                                Task ID: {task.id}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
