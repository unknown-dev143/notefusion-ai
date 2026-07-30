import React, { useState, useEffect } from 'react';
import { Plus, List, Kanban, MoreHorizontal, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { taskApiService, Task, TaskStatus, TaskPriority } from '../features/tasks/services/taskApiService';
import toast from 'react-hot-toast';

const TasksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskApiService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Optimistic update
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    setDraggedTaskId(null);

    try {
      await taskApiService.updateTaskStatus(taskId, status);
      toast.success('Task updated');
    } catch (err) {
      setTasks(originalTasks); // Revert
      toast.error('Failed to update status');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleAddTask = async () => {
      const title = prompt("Enter task title:");
      if (!title) return;
      
      try {
          const newTask = await taskApiService.createTask({
              title,
              status: 'todo',
              priority: 'medium',
              tags: [], 
              description: '',
              due_date: new Date().toISOString().split('T')[0]
          });
          setTasks([...tasks, newTask]);
          toast.success("Task created!");
      } catch (err) {
          toast.error("Failed to create task");
      }
  };
  
  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Delete this task?")) return;
      try {
          await taskApiService.deleteTask(id);
          setTasks(tasks.filter(t => t.id !== id));
          toast.success("Task deleted");
      } catch (err) {
          toast.error("Failed to delete");
      }
  };

  const getPriorityColor = (p: string) => {
     switch(p) {
        case 'high': return 'bg-rose-100 text-rose-600';
        case 'medium': return 'bg-amber-100 text-amber-600';
        default: return 'bg-emerald-100 text-emerald-600';
     }
  };

  const startFocusSession = (task: Task) => {
      toast((t) => (
          <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full text-white animate-pulse"><Play size={16} fill="white"/></div>
              <div>
                  <p className="font-bold text-sm">Focus Session Started</p>
                  <p className="text-xs text-slate-500">Now working on: {task.title}</p>
              </div>
          </div>
      ), { duration: 4000, position: 'top-center' });
  };

  const Columns = [
     { id: 'todo', label: 'To Do', icon: <AlertCircle size={16}/>, color: 'bg-slate-100 border-slate-200' },
     { id: 'in-progress', label: 'In Progress', icon: <Clock size={16}/>, color: 'bg-blue-50 border-blue-100' },
     { id: 'done', label: 'Completed', icon: <CheckCircle size={16}/>, color: 'bg-emerald-50 border-emerald-100' }
  ];

  if (loading) return <div className="p-10 text-center">Loading tasks...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Project Board</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage tasks & deadlines</p>
        </div>
        
        <div className="flex gap-4">
           {/* View Toggle */}
           <div className="bg-slate-100 p-1 rounded-xl flex">
              <button 
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <List size={20}/>
              </button>
              <button 
                 onClick={() => setViewMode('board')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <Kanban size={20}/>
              </button>
           </div>

           <button onClick={handleAddTask} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
              <Plus size={16}/> New Task
           </button>
        </div>
      </div>

      {viewMode === 'board' ? (
         <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-8 h-full min-w-[1000px]">
               {Columns.map(col => (
                  <div 
                     key={col.id}
                     className={`flex-1 flex flex-col rounded-[32px] border ${col.color} p-4 transition-colors`}
                     onDrop={(e) => handleDrop(e, col.id as TaskStatus)}
                     onDragOver={handleDragOver}
                  >
                     <div className="flex items-center justify-between mb-6 px-4 pt-2">
                        <div className="flex items-center gap-2 font-black text-slate-700">
                           {col.icon}
                           <h3>{col.label}</h3>
                           <span className="bg-white/50 px-2 py-1 rounded-md text-xs text-slate-500">
                              {tasks.filter(t => t.status === col.id).length}
                           </span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-700">
                           <MoreHorizontal size={16}/>
                        </button>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
                        {tasks.filter(t => t.status === col.id).length > 0 ? (
                           tasks.filter(t => t.status === col.id).map(task => (
                              <div 
                                 key={task.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, task.id)}
                                 className={`bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                                    draggedTaskId === task.id ? 'opacity-50' : ''
                                 }`}
                              >
                                 <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${getPriorityColor(task.priority)}`}>
                                       {task.priority}
                                    </span>
                                        <button onClick={(e) => handleDeleteTask(task.id, e)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-opacity">
                                           <MoreHorizontal size={16}/>
                                        </button>
                                     </div>
                                     <div className="flex justify-between items-start group-hover:translate-x-1 transition-transform">
                                         <h4 className="font-bold text-slate-800 mb-2 leading-snug flex-1">{task.title}</h4>
                                         <button onClick={() => startFocusSession(task)} className="p-2 bg-blue-50 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 shadow-sm" title="Start Focus Session">
                                             <Play size={12} fill="currentColor"/>
                                         </button>
                                     </div>
                                 <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{task.description}</p>
                                 
                                 <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                       <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                       <Clock size={12}/> {task.due_date}
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-10 opacity-40">
                              <p className="text-xs font-bold text-slate-400">No tasks here</p>
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      ) : (
         /* List View Fallback */
         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            {tasks.map(task => (
               <div key={task.id} className="p-6 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                     <div>
                        <h4 className="font-bold text-slate-800">{task.title}</h4>
                        <p className="text-xs text-slate-400">{task.description}</p>
                     </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${getPriorityColor(task.priority)}`}>{task.priority}</span>
               </div>
            ))}
         </div>
      )}

    </div>
  );
};

export default TasksPage;
