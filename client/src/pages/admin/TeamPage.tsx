import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Plus, Search, Trash, List, Grid, X, MoreHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface TeamMember {
  id: number;
  name: string;
  position?: string;
  department?: string;
  location?: string;
  bio: string;
  expertise: string[];
  image: string | null;
  slug: string;
  metaDescription: string | null;
  email?: string;
  linkedin: string;
  services?: ServiceContent[];
}

interface ServiceContent {
  id: number;
  title: string;
  description: string;
  details: string[];
  category: string;
  image?: string;
  order_index: number;
  updated_at: string;
  updated_by?: number;
}

export default function TeamPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    location: '',
    bio: '',
    expertise: '',
    email: '',
    linkedin: '',
    image: null as File | null,
    serviceIds: [] as number[]
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Clean up image preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Get unique departments and locations, filtering out empty/null/undefined values
  const departments = [...new Set(teamMembers.map(member => member.department).filter(dept => dept && dept.trim() !== ''))];
  const locations = [...new Set(teamMembers.map(member => member.location).filter(loc => loc && loc.trim() !== ''))];

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      member.name?.toLowerCase().includes(searchLower) ||
      member.position?.toLowerCase().includes(searchLower) ||
      member.department?.toLowerCase().includes(searchLower);

    // Department filter
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;

    // Location filter
    const matchesLocation = !selectedLocation || member.location === selectedLocation;

    // Service filter
    const matchesService = !selectedService || 
      (member.services && member.services.some(s => s.id === selectedService));

    return matchesSearch && matchesDepartment && matchesLocation && matchesService;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const endIndex = startIndex + membersPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push('ellipsis');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedMembers(new Set());
  };

  // Reset filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment(null);
    setSelectedLocation(null);
    setSelectedService(null);
    setCurrentPage(1);
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedMembers.size === currentMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(currentMembers.map(m => m.id)));
    }
  };

  const toggleMemberSelection = (memberId: number) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    try {
      for (const memberId of selectedMembers) {
        await handleDelete({ id: memberId } as TeamMember);
      }
      toast({
        title: "Success",
        description: `Deleted ${selectedMembers.size} team members successfully`,
      });
      setSelectedMembers(new Set());
      setIsBulkDeleting(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected team members",
        variant: "destructive",
      });
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Use absolute URL to ensure we're hitting the right endpoint
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const response = await fetch(`${baseUrl}/api/team`);
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch team members.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      // Use absolute URL to ensure we're hitting the right endpoint
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const response = await fetch(`${baseUrl}/api/content/services`);
      
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch services.',
      });
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchServices();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'expertise') {
          const expertiseLines = (value as string).split('\n').filter(Boolean);
          formDataToSend.append(key, JSON.stringify(expertiseLines));
        } else if (key === 'serviceIds') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'image' && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Use absolute URL to ensure we're hitting the right endpoint
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const url = selectedMember
        ? `${baseUrl}/api/admin/team/${selectedMember.id}`
        : `${baseUrl}/api/admin/team`;
      
      const response = await fetch(url, {
        method: selectedMember ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-jwt')}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `Team member ${selectedMember ? 'updated' : 'created'} successfully.`,
        });
        setIsDialogOpen(false);
        setImagePreview(null);
        fetchTeamMembers();
      } else {
        throw new Error(data.message || "Failed to save team member");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${selectedMember ? 'update' : 'create'} team member: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  // Handle delete
  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to delete ${member.name}?`)) {
      return;
    }
    
    try {
      // Use absolute URL to ensure we're hitting the right endpoint
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const url = `${baseUrl}/api/admin/team/${member.id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-jwt')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Team member deleted successfully.',
        });
        fetchTeamMembers();
      } else {
        throw new Error(data.message || "Failed to delete team member");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete team member: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <div className="flex items-center gap-2">
          {selectedMembers.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedMembers.size})
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsBulkDeleting(true)}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => {
            setSelectedMember(null);
            setFormData({
              name: '',
              position: '',
              department: '',
              location: '',
              bio: '',
              expertise: '',
              email: '',
              linkedin: '',
              image: null,
              serviceIds: []
            });
            setImagePreview(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
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
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Department</Label>
              <Select
                value={selectedDepartment || 'all'}
                onValueChange={(value) => {
                  setSelectedDepartment(value === 'all' ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept || 'unknown'}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Location</Label>
              <Select
                value={selectedLocation || 'all'}
                onValueChange={(value) => {
                  setSelectedLocation(value === 'all' ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc || 'unknown'}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Service</Label>
              <Select
                value={selectedService?.toString() || 'all'}
                onValueChange={(value) => {
                  setSelectedService(value === 'all' ? null : Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
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

      {/* View Mode Toggle */}
      <div className="flex justify-end space-x-2">
        <Button 
          variant={viewMode === 'grid' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setViewMode('grid')}
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button 
          variant={viewMode === 'list' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setViewMode('list')}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : currentMembers.length === 0 ? (
            <p>No team members found.</p>
          ) : (
            currentMembers.map((member) => (
              <Card key={member.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium">{member.name}</h3>
                    <p className="text-xs">{member.position}</p>
                    <Badge variant="outline" className="mt-1">
                      {member.department}
                    </Badge>
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
                      <DropdownMenuItem onClick={() => {
                        setSelectedMember(member);
                        setFormData({
                          name: member.name,
                          position: member.position || '',
                          department: member.department || '',
                          location: member.location || '',
                          bio: member.bio || '',
                          expertise: member.expertise.join('\n'),
                          email: member.email || '',
                          linkedin: member.linkedin || '',
                          image: null,
                          serviceIds: member.services?.map(service => service.id) || []
                        });
                        setImagePreview(null);
                        setIsDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(member)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {member.image && (
                  <img
                    src={member.image.includes('://') ? member.image : `/uploads/team/${member.image}`}
                    alt={member.name}
                    className="w-full aspect-[3/4] object-cover rounded-md"
                    onError={(e) => {
                      console.error("Error loading image:", member.image);
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                )}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{member.location}</p>
                  <div className="text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: member.bio }} />
                  {member.services && member.services.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-500">Areas of expertise:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.services.map(service => (
                          <Badge key={service.id} variant="secondary" className="text-xs">
                            {service.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <Checkbox 
                    checked={currentMembers.length > 0 && selectedMembers.size === currentMembers.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : currentMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No team members found.</TableCell>
                </TableRow>
              ) : (
                currentMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => toggleMemberSelection(member.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.department}</Badge>
                    </TableCell>
                    <TableCell>{member.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedMember(member);
                          setFormData({
                            name: member.name,
                            position: member.position || '',
                            department: member.department || '',
                            location: member.location || '',
                            bio: member.bio || '',
                            expertise: member.expertise.join('\n'),
                            email: member.email || '',
                            linkedin: member.linkedin || '',
                            image: null,
                            serviceIds: member.services?.map(service => service.id) || []
                          });
                          setIsDialogOpen(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(member)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} team members
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
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
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNumber as number);
                    }}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleting} onOpenChange={(open) => !open && setIsBulkDeleting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Team Members</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMembers.size} selected team members? This action cannot be undone.
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
              Delete {selectedMembers.size} Team Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
            <DialogDescription>
              {selectedMember 
                ? 'Update the details of the team member.' 
                : 'Fill in the details to add a new team member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="Enter LinkedIn profile URL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <RichTextEditor
                value={formData.bio}
                onChange={(value) => setFormData({ ...formData, bio: value })}
                placeholder="Enter team member bio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <Textarea
                id="expertise"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                placeholder="Enter areas of expertise (one per line)"
                rows={4}
              />
              <p className="text-sm text-gray-500">Enter each expertise on a new line</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Associated Services</Label>
              <Select
                value={formData.serviceIds.length > 0 ? formData.serviceIds.join(',') : "no-services"}
                onValueChange={(value) => {
                  const ids = value === "no-services" ? [] : value.split(',').map(Number);
                  setFormData({ ...formData, serviceIds: ids });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-services">No services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Clean up previous preview URL
                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview);
                    }
                    // Create new preview URL
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                    setFormData({ ...formData, image: file });
                  }
                }}
              />
              {(imagePreview || (selectedMember?.image)) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">
                    {imagePreview ? 'New image preview:' : 'Current image:'}
                  </p>
                  <img
                    src={imagePreview || (selectedMember?.image && selectedMember.image.includes('://') 
                      ? selectedMember.image 
                      : selectedMember?.image ? `/uploads/team/${selectedMember.image}` : '')}
                    alt={selectedMember?.name || 'Preview'}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedMember ? 'Update Team Member' : 'Add Team Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 