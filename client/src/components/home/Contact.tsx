import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Mail, Building, Phone, Globe } from 'lucide-react';
import * as locationsApi from '@/api/locations';
import type { Location } from '@shared/schema';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getLocations
  });

  const locations = locationsData?.data || [];

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      apiRequest('POST', '/api/contact', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your message has been sent successfully.',
      });
      reset();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark mb-4">Connect With Us</h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Let's start a conversation about how PACT can support your organization's journey toward positive transformation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-20">
            <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register('message')}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors text-lg font-medium"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Locations Section */}
        {locations.length > 0 && (
          <div className="mt-20" data-aos="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dark mb-4">Our Locations</h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                With offices strategically located around the world, we're ready to help wherever you are.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {locations.map((location: Location) => (
                <div
                  key={location.id}
                  className="relative group overflow-hidden rounded-lg shadow-md"
                  data-aos="fade-up"
                >
                  {location.image && (
                    <div className="relative h-36">
                      <img
                        src={location.image}
                        alt={`${location.city}, ${location.country}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-sm text-white/90 mb-1">{location.city}, {location.country}</p>
                    {location.address && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
