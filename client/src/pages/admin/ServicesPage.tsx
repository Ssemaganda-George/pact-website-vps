import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Icons
import { Edit, Trash, MoreVertical, Plus, X, Briefcase, ArrowUpDown, Loader2 } from 'lucide-react';

// Define the service schema
const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().min(1, 'Details are required'),
  image: z.any().optional(), // file or string (for preview)
  order_index: z.number().int().default(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Form setup
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      description: '',
      details: '',
      image: '',
      order_index: 0
    }
  });

  // Fetch services
  const { data: servicesData, isLoading } = useQuery<{
    success: boolean;
    data: any[];
    message?: string;
  }>({
    queryKey: ['/api/content/services'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      // Convert details to JSON array string
      const detailsArray = data.details
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      formData.append('details', JSON.stringify(detailsArray));
      formData.append('order_index', String(data.order_index));
      if (data.image && data.image instanceof File) {
        formData.append('image', data.image);
      }
      return await fetch('/api/admin/content/service', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cms-jwt') || ''}`
        },
        body: formData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/services'] });
      toast({
        title: 'Service created',
        description: 'The service has been created successfully.',
      });
      setDialogOpen(false);
      setImagePreview(null);
      form.reset();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to create service',
        description: 'An error occurred while creating the service.',
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData & { id: number }) => {
      const { id, ...serviceData } = data;
      const formData = new FormData();
      formData.append('title', serviceData.title);
      formData.append('description', serviceData.description);
      // Convert details to JSON array string
      const detailsArray = serviceData.details
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      formData.append('details', JSON.stringify(detailsArray));
      formData.append('order_index', String(serviceData.order_index));
      if (serviceData.image && serviceData.image instanceof File) {
        formData.append('image', serviceData.image);
      } else if (typeof serviceData.image === 'string') {
        formData.append('image', serviceData.image);
      }
      return await fetch(`/api/admin/content/service/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cms-jwt') || ''}`
        },
        body: formData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/services'] });
      toast({
        title: 'Service updated',
        description: 'The service has been updated successfully.',
      });
      setDialogOpen(false);
      setEditingService(null);
      setImagePreview(null);
      form.reset();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to update service',
        description: 'An error occurred while updating the service.',
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/content/service/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/services'] });
      toast({
        title: 'Service deleted',
        description: 'The service has been deleted successfully.',
      });
      setDeleteDialogOpen(false);
      setEditingService(null);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete service',
        description: 'An error occurred while deleting the service.',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ ...data, id: editingService.id });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  // Edit service handler
  const handleEditService = (service: any) => {
    setEditingService(service);
    form.reset({
      title: service.title,
      description: service.description,
      details: Array.isArray(service.details) ? service.details.join('\n') : service.details,
      image: service.image,
      order_index: service.order_index || 0
    });
    setImagePreview(null);
    setDialogOpen(true);
  };

  // Delete service handler
  const handleDeleteService = (service: any) => {
    setEditingService(service);
    setDeleteDialogOpen(true);
  };

  // Add new service handler
  const handleAddService = () => {
    setEditingService(null);
    form.reset({
      title: '',
      description: '',
      details: '',
      image: '',
      order_index: 0
    });
    setImagePreview(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
        <Button onClick={handleAddService} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Add New Service
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Services</CardTitle>
          <CardDescription>
            Add, edit, or remove services displayed on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : servicesData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md">
              <Briefcase className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-500">No services found</p>
              <Button variant="link" onClick={handleAddService} className="mt-2">
                Add your first service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {servicesData?.data?.map((service: any) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="relative h-36 md:w-48 md:h-auto md:min-h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                          <p className="text-gray-500 mb-4">{service.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditService(service)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Accordion type="single" collapsible className="mt-2">
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-sm font-medium">
                            Service Details
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                              {Array.isArray(service.details) ? (
                                service.details.map((detail: string, index: number) => (
                                  <li key={index}>{detail}</li>
                                ))
                              ) : (
                                <li>No details available</li>
                              )}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService 
                ? 'Update the service details below.' 
                : 'Fill in the details to create a new service.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Service title" {...field} />
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
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the service" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details* (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter service details (one per line)" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image*</FormLabel>
                    <FormControl>
                      <div>
                        {(imagePreview || (field.value && typeof field.value === 'string')) && (
                          <img 
                            src={imagePreview || field.value} 
                            alt="Service" 
                            className="mb-2 w-full h-32 object-cover rounded" 
                          />
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              // Clean up previous preview
                              if (imagePreview) {
                                URL.revokeObjectURL(imagePreview);
                              }
                              // Create new preview
                              const previewUrl = URL.createObjectURL(e.target.files[0]);
                              setImagePreview(previewUrl);
                              field.onChange(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="order_index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                >
                  {(createServiceMutation.isPending || updateServiceMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="font-medium">{editingService?.title}</h4>
            <p className="text-sm text-gray-500">{editingService?.description}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteServiceMutation.mutate(editingService?.id)}
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}