import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as locationsApi from '@/api/locations';
import { useToast } from '@/hooks/use-toast';
import type { Location } from '../../../../shared/schema';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
  city: string;
  country: string;
  image: File | string | null;
  address: string;
}

export default function LocationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<FormData>({
    city: '',
    country: '',
    image: null,
    address: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  // Fetch locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getLocations
  });
  
  // Create location mutation
  const createMutation = useMutation({
    mutationFn: locationsApi.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Location created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create location: ${error.message}`,
      });
    },
  });
  
  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { city?: string; country?: string; address?: string; image?: File | string | null } }) => 
      locationsApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Location updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update location: ${error.message}`,
      });
    },
  });
  
  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: locationsApi.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete location: ${error.message}`,
      });
    },
  });
  
  const resetForm = () => {
    setFormData({
      city: '',
      country: '',
      image: null,
      address: ''
    });
    setImagePreview(null);
    setSelectedLocation(null);
  };
  
  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      city: location.city,
      country: location.country,
      image: location.image || null,
      address: location.address || ''
    });
    setImagePreview(location.image || null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const data = {
      city: formData.city,
      country: formData.country,
      image: formData.image,
      address: formData.address
    };

    if (selectedLocation) {
      updateMutation.mutate({ 
        id: selectedLocation.id, 
        data
      });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const locations = locationsData?.data || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          Add Location
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Office Locations</CardTitle>
          <CardDescription>
            Manage your office locations worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locations found. Add your first location!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location: Location) => (
                <Card key={location.id} className="relative">
                  {location.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={location.image}
                        alt={`${location.city}, ${location.country}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-600 mb-1">{location.city}, {location.country}</p>
                        {location.address && (
                          <p className="text-sm text-gray-500 mb-1">{location.address}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
            <DialogDescription>
              {selectedLocation ? 'Update the location details below.' : 'Enter the location details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Location Image</Label>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48 overflow-hidden rounded-md">
                      <img
                        src={imagePreview}
                        alt="Location preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedLocation ? 'Update Location' : 'Add Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 