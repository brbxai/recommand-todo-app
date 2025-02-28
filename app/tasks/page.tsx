import { rc } from "@recommand/lib/client";
import type { Task, Tasks } from "api/tasks";
import { useState } from "react";
import { useEffect } from "react";
import { Input } from "@core/components/ui/input";
import { Button } from "@core/components/ui/button";
import { stringifyActionFailure } from "@recommand/lib/utils";
import { toast } from "@core/components/ui/sonner";

const client = rc<Tasks>('todo-app');

export default function Page() {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = () => {
        client.tasks.$get().then(async (res) => {
            const json = await res.json();
            if (json.success) {
                setTasks(json.tasks);
            }else{
                toast.error(stringifyActionFailure(json.errors));
            }
        });
    };

    const toggleTaskStatus = (taskId: number, currentStatus: boolean) => {
        // Use the correct API endpoint structure
        client.tasks[':id'].$put({
            param: { id: taskId.toString() },
            json: {
                completed: !currentStatus
            }
        }).then(async (res: Response) => {
            const json = await res.json();
            if (json.success) {
                // Update the task in the local state
                setTasks(tasks.map(task => 
                    task.id === taskId ? json.task : task
                ));
                toast.success("Task status updated successfully");
            }else{
                toast.error(stringifyActionFailure(json.errors));
            }
        });
    };

    const navigateToTaskDetail = (taskId: number) => {
        window.location.href = `/tasks/${taskId}`;
    };

    return <div className="flex flex-col gap-4 max-w-md mx-auto my-10">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex flex-col gap-2">
            {tasks.map((task) => (
                <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 border rounded-md ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
                >
                    <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskStatus(task.id, task.completed)}
                        id={`task-${task.id}`}
                        className="h-4 w-4"
                    />
                    <div className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        <label 
                            htmlFor={`task-${task.id}`}
                            className="font-medium cursor-pointer"
                        >
                            {task.title}
                        </label>
                        {task.description && (
                            <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToTaskDetail(task.id)}
                        className="ml-auto"
                    >
                        View
                    </Button>
                </div>
            ))}
            {tasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No tasks yet. Create one below!</p>
            )}
        </div>
        <div className="mt-4 p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-3">Add Task</h2>
            <Input 
                type="text" 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="mb-2"
            />
            <Input 
                type="text" 
                placeholder="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="mb-3"
            />
            <Button
                onClick={() => {
                    if (!title.trim()) return;
                    client.tasks.$post({
                        json: {
                            title,
                            description
                        }
                    }).then(async (res) => {
                        const json = await res.json();
                        if (json.success) {
                            setTasks([...tasks, json.task]);
                            setTitle("");
                            setDescription("");
                        }
                    });
                }}
                className="w-full"
            >Create Task</Button>
        </div>
    </div>
}