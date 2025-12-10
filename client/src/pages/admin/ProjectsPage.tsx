import React, { useState, useEffect, useMemo } from 'react';
import { useProjects } from '@/context/ProjectsContext';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicesApi } from '@/api/services';
import type { ServiceContent, ProjectContent, ProjectStatus } from '@shared/schema';
import { ProjectStatus as ProjectStatusEnum } from '@shared/schema';
import { Eye, Pencil, Trash2, X, Download, Upload, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RichTextEditor from '@/components/admin/RichTextEditor';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Form schema matching the database schema
const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  organization: z.string().min(1, "Organization is required"),
  category: z.string().min(1, "Category is required"),
  bg_image: z.string().nullable(),
  icon: z.string().nullable(),
  duration: z.string().nullable(),
  location: z.string().nullable(),
  services: z.array(z.number()).nullable(),
  order_index: z.number().optional(),
  status: z.enum([ProjectStatusEnum.DRAFT, ProjectStatusEnum.IN_PROGRESS, ProjectStatusEnum.COMPLETED, ProjectStatusEnum.ARCHIVED]).nullable(),
  image: z.string().nullable()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Define the Project type to match the database schema
interface Project {
  id: number;
  title: string;
  description: string;
  organization: string;
  category: string | null;
  bg_image: string | null;
  icon: string | null;
  duration: string | null;
  location: string | null;
  image: string | null;
  status: ProjectStatus | null;
  services: string[] | null;
  order_index: number | null;
  updated_at: Date;
  updated_by: number | null;
}

export default function ProjectsPage() {
  const { projects, loading, error, addProject, updateProject, deleteProject } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [availableServices, setAvailableServices] = useState<ServiceContent[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<Error | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (bgImagePreview && bgImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(bgImagePreview);
      }
    };
  }, [bgImagePreview]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Get unique categories from projects
  const categories = useMemo(() => {
    const uniqueCategories = new Set(projects.map(p => p.category).filter(Boolean));
    return Array.from(uniqueCategories) as string[];
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project: Project) => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        project.title.toLowerCase().includes(searchLower) ||
        project.organization.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !selectedStatus || project.status === selectedStatus;

      // Category filter
      const matchesCategory = !selectedCategory || project.category === selectedCategory;

      // Service filter
      const matchesService = !selectedService || 
        (project.services && availableServices
          .filter(s => project.services!.includes(s.id.toString()))
          .some(s => s.title === selectedService));

      return matchesSearch && matchesStatus && matchesCategory && matchesService;
    });
  }, [projects, searchQuery, selectedStatus, selectedCategory, selectedService, availableServices]);

  // Reset filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus(null);
    setSelectedCategory(null);
    setSelectedService(null);
    setCurrentPage(1);
  };

  // Calculate pagination based on filtered projects
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedProjects(new Set()); // Clear selections on page change
  };

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const services = await servicesApi.getAllServices();
        setAvailableServices(services);
        setServicesError(null);
      } catch (err) {
        setServicesError(err instanceof Error ? err : new Error('Failed to fetch services'));
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      organization: "",
      category: "",
      bg_image: null,
      icon: null,
      duration: null,
      location: null,
      services: [],
      order_index: 0,
      status: null,
      image: null
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const formDataToSend = new FormData();
      
      // Add all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'services' && Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add the image file if it exists
      if (bgImageFile) {
        formDataToSend.append('bg_image_file', bgImageFile);
      }
      
      if (isEditing && currentProject) {
        await updateProject(currentProject.id, formDataToSend);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        await addProject(formDataToSend);
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }
      setIsEditing(false);
      setIsCreating(false);
      form.reset();
      setBgImageFile(null);
      setBgImagePreview(null);
      setCurrentProject(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    form.reset({
      title: project.title,
      description: project.description,
      organization: project.organization,
      category: project.category || '',
      bg_image: project.bg_image,
      icon: project.icon,
      duration: project.duration,
      location: project.location,
      services: project.services ? project.services.map(s => parseInt(s)) : [],
      order_index: project.order_index || 0,
      status: project.status,
      image: project.image
    });
    setBgImagePreview(project.bg_image || null);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      await deleteProject(id);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setBgImagePreview(imageUrl);
      form.setValue('bg_image', imageUrl);
    }
  };

  const clearImage = () => {
    setBgImageFile(null);
    setBgImagePreview(null);
    form.setValue('bg_image', null);
  };

  // Export projects function
  const handleExport = () => {
    try {
      const projectsToExport = projects.map((project: Project) => ({
        title: project.title,
        description: project.description,
        organization: project.organization,
        category: project.category || '',
        bg_image: project.bg_image,
        icon: project.icon,
        duration: project.duration,
        location: project.location,
        services: project.services,
        order_index: project.order_index || 0,
        status: project.status,
        image: project.image
      }));

      const blob = new Blob([JSON.stringify(projectsToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pact-projects-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Projects exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export projects",
        variant: "destructive",
      });
    }
  };

  // Import projects function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const projectsToImport = JSON.parse(content);

          // Validate imported data
          if (!Array.isArray(projectsToImport)) {
            throw new Error('Invalid import format: expected an array of projects');
          }

          // Import each project
          for (const project of projectsToImport) {
            const formData = new FormData();
            Object.entries(project).forEach(([key, value]) => {
              if (key === 'services' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
              }
            });
            await addProject(formData);
          }

          toast({
            title: "Success",
            description: `Successfully imported ${projectsToImport.length} projects`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to process import file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import projects",
        variant: "destructive",
      });
    }
    // Reset the input
    event.target.value = '';
  };

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const toggleProjectSelection = (projectId: number) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  // Bulk actions
  const handleBulkExport = () => {
    try {
      const projectsToExport = projects
        .filter((project: Project) => selectedProjects.has(project.id))
        .map((project: Project) => ({
          title: project.title,
          description: project.description,
          organization: project.organization,
          category: project.category || '',
          bg_image: project.bg_image,
          icon: project.icon,
          duration: project.duration,
          location: project.location,
          services: project.services,
          order_index: project.order_index || 0,
          status: project.status,
          image: project.image
        }));

      const blob = new Blob([JSON.stringify(projectsToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pact-projects-selected-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Exported ${projectsToExport.length} projects successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export selected projects",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const projectId of selectedProjects) {
        await deleteProject(projectId);
      }
      toast({
        title: "Success",
        description: `Deleted ${selectedProjects.size} projects successfully`,
      });
      setSelectedProjects(new Set());
      setIsBulkDeleting(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected projects",
        variant: "destructive",
      });
    }
  };

  if (loading || servicesLoading) {
    return <div>Loading...</div>;
  }

  if (error || servicesError) {
    return <div>Error: {(error || servicesError)?.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects Management</h1>
        <div className="flex items-center gap-2">
          {selectedProjects.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedProjects.size})
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleBulkExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsBulkDeleting(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button 
            onClick={() => {
              form.reset();
              setIsCreating(true);
            }}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            Add New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label>Search</Label>
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus || undefined}
                onValueChange={(value) => {
                  setSelectedStatus(value as ProjectStatus || null);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.values(ProjectStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || undefined}
                onValueChange={(value) => {
                  setSelectedCategory(value === "all" ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Service</Label>
              <Select
                value={selectedService || undefined}
                onValueChange={(value) => {
                  setSelectedService(value === "all" ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Manage your organization's projects and case studies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 mb-4">No projects found</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  setIsCreating(true);
                }}
              >
                Create your first project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <Checkbox 
                          checked={currentProjects.length > 0 && selectedProjects.size === currentProjects.length}
                          onCheckedChange={() => {
                            if (selectedProjects.size === currentProjects.length) {
                              setSelectedProjects(new Set());
                            } else {
                              setSelectedProjects(new Set(currentProjects.map(p => p.id)));
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedProjects.has(project.id)}
                            onCheckedChange={() => toggleProjectSelection(project.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.category}</TableCell>
                        <TableCell>{project.organization}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                            {project.status || 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setCurrentProject(project);
                                setIsViewing(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(project)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setCurrentProject(project);
                                setIsDeleting(true);
                              }}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, projects.length)} of {projects.length} projects
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                      <PaginationItem key={index}>
                        {pageNumber === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber as number)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import/Export buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <input
          type="file"
          id="import-projects"
          className="hidden"
          accept=".json"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('import-projects')?.click()}
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Projects
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Projects
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
              form.reset();
        }
            }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Project' : 'Edit Project'}</DialogTitle>
            <DialogDescription>
              {isCreating 
                ? 'Add a new project to your portfolio' 
                : 'Make changes to the selected project'}
            </DialogDescription>
            </DialogHeader>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <RichTextEditor 
                          value={field.value} 
                          onChange={field.onChange}
                          placeholder="Project description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="e.g. January 2024 - March 2024" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="e.g. Khartoum" />
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
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={field.value || ''} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Services</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                          {availableServices.map(service => (
                            <div key={service.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`service-${service.id}`}
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), service.id]
                                    : (field.value || []).filter(s => s !== service.id);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label 
                                htmlFor={`service-${service.id}`}
                                className="text-sm cursor-pointer truncate"
                              >
                                {service.title}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bg_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="cursor-pointer"
                            />
                            {bgImagePreview && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={clearImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {bgImagePreview && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden">
                              <img
                                src={bgImagePreview}
                                alt="Background preview"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isCreating ? 'Create Project' : 'Save Changes'}
                </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
          </DialogContent>
        </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{currentProject?.title}</p>
            <p className="text-sm text-gray-500 mt-1">{currentProject?.organization}</p>
      </div>
          <DialogFooter>
                    <Button
              variant="outline" 
              onClick={() => setIsDeleting(false)}
                    >
              Cancel
                    </Button>
                    <Button
              variant="destructive" 
              onClick={() => {
                if (currentProject) {
                  deleteProject(currentProject.id);
                  setIsDeleting(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={isViewing} onOpenChange={(open) => !open && setIsViewing(false)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentProject?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={currentProject?.status === 'completed' ? 'default' : 'secondary'}>
                  {currentProject?.status || 'In Progress'}
                </Badge>
                <span className="text-sm text-gray-500">{currentProject?.organization}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {currentProject?.bg_image && (
              <div className="mb-4">
                <img 
                  src={currentProject.bg_image} 
                  alt={currentProject.title} 
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <div 
                  className="text-gray-700 prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: currentProject?.description || '' }}
                />
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium">Project Details</h3>
                <div className="mt-2 space-y-2">
                  {currentProject?.location && (
                    <div>
                      <span className="text-sm font-medium">Location: </span>
                      <span className="text-gray-700">{currentProject.location}</span>
                    </div>
                  )}
                  {currentProject?.duration && (
                    <div>
                      <span className="text-sm font-medium">Duration: </span>
                      <span className="text-gray-700">{currentProject.duration}</span>
                    </div>
                  )}
                  {currentProject?.services && currentProject.services.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Services: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentProject.services.map((serviceId) => {
                          const service = availableServices.find(s => s.id === parseInt(serviceId));
                          return service ? (
                            <Badge key={serviceId} variant="outline">{service.title}</Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewing(false)}
            >
              Close
                    </Button>
                    <Button
              onClick={() => {
                setIsViewing(false);
                if (currentProject) {
                  handleEdit(currentProject);
                }
              }}
            >
              Edit Project
                    </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleting} onOpenChange={(open) => !open && setIsBulkDeleting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Projects</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProjects.size} selected projects? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBulkDeleting(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
            >
              Delete {selectedProjects.size} Projects
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}