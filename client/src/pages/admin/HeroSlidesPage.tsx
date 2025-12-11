import { useEffect, useState } from 'react';
import { LucideEdit, Trash2, Plus, ArrowUp, ArrowDown, Image, Video, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Define the HeroSlide interface
interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  actionText: string;
  actionLink: string;
  backgroundImage: string;
  category?: string;
  videoBackground?: string;
  accentColor?: string;
  order_index: number;
}

const HeroSlidesPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<HeroSlide | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview]);

  // Form state for new/edited slide
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    description: '',
    actionText: '',
    actionLink: '',
    backgroundImage: '',
    category: '',
    videoBackground: '',
    accentColor: '#000000',
    order_index: 0
  });

  // Fetch all slides
  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hero-slides');
        const data = await response.json();
        
        if (data.success) {
          // Map API response fields (snake_case) to component interface (camelCase)
          const mappedSlides = data.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            actionText: slide.action_text,
            actionLink: slide.action_link,
            backgroundImage: slide.background_image,
            category: slide.category,
            videoBackground: slide.video_background,
            accentColor: slide.accent_color,
            order_index: slide.order_index
          }));
          setSlides(mappedSlides);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch hero slides',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch hero slides',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [refreshTrigger, toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    
    if (!files || files.length === 0) return;
    
    if (name === 'backgroundImage') {
      setBgImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    } else if (name === 'videoBackground') {
      setVideoFile(files[0]);
      setVideoPreview(URL.createObjectURL(files[0]));
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      actionText: '',
      actionLink: '',
      backgroundImage: '',
      category: '',
      videoBackground: '',
      accentColor: '#000000',
      order_index: slides.length
    });
    setBgImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  // Open edit dialog with slide data
  const openEditDialog = (slide: HeroSlide) => {
    setCurrentSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description,
      actionText: slide.actionText,
      actionLink: slide.actionLink,
      backgroundImage: slide.backgroundImage,
      category: slide.category || '',
      videoBackground: slide.videoBackground || '',
      accentColor: slide.accentColor || '#000000',
      order_index: slide.order_index
    });
    setImagePreview(slide.backgroundImage);
    setVideoPreview(slide.videoBackground || null);
    setIsEditDialogOpen(true);
  };

  // Create a new slide
  const createSlide = async () => {
    try {
      const formDataObj = new FormData();
      
      // Add text fields (exclude backgroundImage if file is selected)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && !(key === 'backgroundImage' && bgImageFile)) {
          formDataObj.append(key, value.toString());
        }
      });
      
      // Add files if they exist
      if (bgImageFile) {
        formDataObj.append('backgroundImage', bgImageFile);
      }
      
      if (videoFile) {
        formDataObj.append('videoBackground', videoFile);
      }
      
      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Hero slide created successfully',
        });
        setIsAddDialogOpen(false);
        resetForm();
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create hero slide',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating hero slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to create hero slide',
        variant: 'destructive',
      });
    }
  };

  // Update an existing slide
  const updateSlide = async () => {
    if (!currentSlide) return;
    
    try {
      const formDataObj = new FormData();
      
      // Add text fields (exclude backgroundImage if file is selected)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && !(key === 'backgroundImage' && bgImageFile)) {
          formDataObj.append(key, value.toString());
        }
      });
      
      // Add files if they exist
      if (bgImageFile) {
        formDataObj.append('backgroundImage', bgImageFile);
      }
      
      if (videoFile) {
        formDataObj.append('videoBackground', videoFile);
      }
      
      const response = await fetch(`/api/hero-slides/${currentSlide.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Hero slide updated successfully',
        });
        setIsEditDialogOpen(false);
        resetForm();
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update hero slide',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating hero slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hero slide',
        variant: 'destructive',
      });
    }
  };

  // Delete a slide
  const deleteSlide = async (id: number) => {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Hero slide deleted successfully',
        });
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete hero slide',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hero slide',
        variant: 'destructive',
      });
    }
  };

  // Reorder slides
  const moveSlide = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(slide => slide.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    
    // Swap order_index values
    const newSlides = [...slides];
    [newSlides[currentIndex].order_index, newSlides[newIndex].order_index] = 
      [newSlides[newIndex].order_index, newSlides[currentIndex].order_index];
    
    // Update both slides
    try {
      const promises = [
        fetch(`/api/hero-slides/${newSlides[currentIndex].id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_index: newSlides[currentIndex].order_index }),
        }),
        fetch(`/api/hero-slides/${newSlides[newIndex].id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_index: newSlides[newIndex].order_index }),
        }),
      ];
      
      await Promise.all(promises);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder slides',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <AdminHeader title="Hero Slides" description="Manage the hero slides on the home page" />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Hero Slides</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Hero Slide</DialogTitle>
              <DialogDescription>
                Create a new slide for the homepage hero section.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter slide title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Enter slide subtitle"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter slide description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionText">Button Text</Label>
                  <Input
                    id="actionText"
                    name="actionText"
                    value={formData.actionText}
                    onChange={handleInputChange}
                    placeholder="Enter button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actionLink">Button Link</Label>
                  <Input
                    id="actionLink"
                    name="actionLink"
                    value={formData.actionLink}
                    onChange={handleInputChange}
                    placeholder="Enter button link"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="accentColor"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 p-0 border-0"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={handleInputChange}
                      name="accentColor"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Background Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundImage"
                    name="backgroundImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {!bgImageFile && (
                    <Input
                      placeholder="Or enter image URL"
                      value={formData.backgroundImage}
                      onChange={handleInputChange}
                      name="backgroundImage"
                      className="flex-1"
                    />
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Background preview" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="videoBackground">Video Background (Optional)</Label>
                <Input
                  id="videoBackground"
                  name="videoBackground"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                {videoPreview && (
                  <div className="mt-2">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSlide}>
                Create Slide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${slide.backgroundImage})`,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backgroundBlendMode: 'multiply'
                }}
              >
                <div className="flex justify-end p-2">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: slide.accentColor || '#000000' }}
                  ></div>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    {slide.category && (
                      <div 
                        className="text-xs font-semibold mb-1 px-2 py-1 rounded" 
                        style={{ 
                          backgroundColor: slide.accentColor || '#000000',
                          color: 'white'
                        }}
                      >
                        {slide.category}
                      </div>
                    )}
                    <CardTitle>{slide.title}</CardTitle>
                    {slide.subtitle && <CardDescription>{slide.subtitle}</CardDescription>}
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={slide.order_index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={slide.order_index === slides.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{slide.description}</p>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Button: </div>
                  <div className="text-sm">{slide.actionText} → {slide.actionLink}</div>
                </div>
                {slide.videoBackground && (
                  <div className="mt-2 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Has video background</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex justify-end space-x-2 w-full">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(slide)}>
                    <LucideEdit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the slide.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSlide(slide.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
            <DialogDescription>
              Update the slide information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter slide title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle (Optional)</Label>
                <Input
                  id="edit-subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Enter slide subtitle"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter slide description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-actionText">Button Text</Label>
                <Input
                  id="edit-actionText"
                  name="actionText"
                  value={formData.actionText}
                  onChange={handleInputChange}
                  placeholder="Enter button text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-actionLink">Button Link</Label>
                <Input
                  id="edit-actionLink"
                  name="actionLink"
                  value={formData.actionLink}
                  onChange={handleInputChange}
                  placeholder="Enter button link"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category (Optional)</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="edit-accentColor"
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleInputChange}
                    className="w-10 h-10 p-0 border-0"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={handleInputChange}
                    name="accentColor"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-backgroundImage">Background Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-backgroundImage"
                  name="backgroundImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {!bgImageFile && (
                  <Input
                    placeholder="Or keep current image"
                    value={formData.backgroundImage}
                    onChange={handleInputChange}
                    name="backgroundImage"
                    className="flex-1"
                  />
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Background preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-videoBackground">Video Background (Optional)</Label>
              <Input
                id="edit-videoBackground"
                name="videoBackground"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
              />
              {videoPreview && (
                <div className="mt-2">
                  <video 
                    src={videoPreview} 
                    controls 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateSlide}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
};

export default HeroSlidesPage; 