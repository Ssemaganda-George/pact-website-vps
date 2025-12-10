import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Save, X, Image } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Define the AboutContent interface
interface AboutContent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  vision?: string;
  mission?: string;
  core_values?: string[];
  updated_at: string;
}

const AboutPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coreValues, setCoreValues] = useState<string[]>([
    'Expertise',
    'Integrity',
    'Excellence',
    'Sustainable Transformation & Empowerment',
    'Respect'
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    vision: 'To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.',
    mission: 'To empower communities socially and economically.'
  });

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Fetch about content
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/about-content');
        const data = await response.json();
        
        if (data.success && data.data) {
          setContent(data.data);
          setFormData({
            title: data.data.title || '',
            subtitle: data.data.subtitle || '',
            description: data.data.description || '',
            vision: data.data.vision || 'To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.',
            mission: data.data.mission || 'To empower communities socially and economically.'
          });
          if (data.data.core_values && Array.isArray(data.data.core_values)) {
            setCoreValues(data.data.core_values);
          }
          if (data.data.image) {
            setImagePreview(data.data.image);
          }
        } else {
          // Set default values if no content exists
          setFormData({
            title: 'About PACT Consultancy',
            subtitle: 'Who We Are',
            description: 'At PACT Consultancy, we partner with organizations to design strategies, build capabilities, and deliver sustainable change.',
            vision: 'To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.',
            mission: 'To empower communities socially and economically.'
          });
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch about content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    
    if (!files || files.length === 0) return;
    
    setImageFile(files[0]);
    setImagePreview(URL.createObjectURL(files[0]));
  };

  // Handle core values change
  const handleCoreValueChange = (index: number, value: string) => {
    const newValues = [...coreValues];
    newValues[index] = value;
    setCoreValues(newValues);
  };

  // Save content
  const saveContent = async () => {
    try {
      setSaving(true);
      
      // Validate form
      if (!formData.title || !formData.description) {
        toast({
          title: 'Validation Error',
          description: 'Title and description are required',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      
      const formDataObj = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, value.toString());
        }
      });
      
      // Add core values as JSON string
      formDataObj.append('core_values', JSON.stringify(coreValues));
      
      // Add image file if it exists
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      // Send request
      const response = await fetch('/api/about-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'About content updated successfully',
        });
        setContent(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update about content',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating about content:', error);
      toast({
        title: 'Error',
        description: 'Failed to update about content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <AdminHeader title="About Section Content" />
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Edit About Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title and Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle (optional)</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Enter subtitle"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows={6}
              />
            </div>
            
            {/* Vision */}
            <div>
              <Label htmlFor="vision">Vision / Core Purpose</Label>
              <Textarea
                id="vision"
                name="vision"
                value={formData.vision}
                onChange={handleInputChange}
                placeholder="Enter vision/core purpose"
                rows={3}
              />
            </div>
            
            {/* Mission */}
            <div>
              <Label htmlFor="mission">Mission</Label>
              <Textarea
                id="mission"
                name="mission"
                value={formData.mission}
                onChange={handleInputChange}
                placeholder="Enter mission"
                rows={2}
              />
            </div>
            
            {/* Core Values */}
            <div>
              <Label>Core Values</Label>
              <div className="space-y-3 mt-2">
                {coreValues.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => handleCoreValueChange(index, e.target.value)}
                      placeholder={`Core Value ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Image Upload */}
            <div>
              <Label>About Section Image</Label>
              <div className="mt-2 flex flex-col md:flex-row gap-4 items-start">
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-64 h-auto object-cover rounded-md border border-gray-200"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveContent} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage; 