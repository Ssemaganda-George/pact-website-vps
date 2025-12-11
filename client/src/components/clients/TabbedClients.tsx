import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClientContent } from '@shared/schema';
import * as clientsApi from '@/api/clients';

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="mb-16">
    <div className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 bg-gray-100 h-12 rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-lg text-gray-500">{message}</p>
  </div>
);

// Client card component
const ClientCard = ({ client }: { client: ClientContent }) => {
  console.log('Client data:', client);
  console.log('Client logo:', client.logo);
  
  return (
    <Card className="p-6 flex flex-col items-center text-center border-2 border-primary/20 hover:border-primary/40 bg-white/50 hover:bg-white transition-all duration-300">
      {client.logo && (
        <div className="h-24 flex items-center justify-center mb-4">
          <img 
            src={client.logo} 
            alt={client.name} 
            className="h-full object-contain"
            onError={(e) => console.log('Image failed to load:', client.logo, e)}
          />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-3">{client.name}</h3>
      {client.description && (
        <p className="text-sm text-gray-600 mb-3">
          {client.description}
        </p>
      )}
      {client.url && (
        <a
          href={client.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 text-sm underline mt-auto"
        >
          Visit Website
        </a>
      )}
    </Card>
  );
};

const TabbedClients = () => {
  const [activeTab, setActiveTab] = useState<string>('clients');

  // Fetch clients
  const { data: clientsData } = useQuery<ClientContent[]>({
    queryKey: ['content', 'clients', 'client'],
    queryFn: async () => {
      const response = await clientsApi.getClientsByType('client');
      return response.data || [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Fetch partners
  const { data: partnersData } = useQuery<ClientContent[]>({
    queryKey: ['content', 'clients', 'partner'],
    queryFn: async () => {
      const response = await clientsApi.getClientsByType('partner');
      return response.data || [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const clients = clientsData || [];
  const partners = partnersData || [];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16" data-aos="fade-up">
          <Tabs defaultValue="clients" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 bg-primary/10 p-1 rounded-lg">
              <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-colors">Our Clients</TabsTrigger>
              <TabsTrigger value="partners" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-colors">Business Associates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clients" className="mt-6">
              {clients.length === 0 ? (
                <EmptyState message="No clients found" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {clients.map(client => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="partners" className="mt-6">
              {partners.length === 0 ? (
                <EmptyState message="No business associates found" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {partners.map(partner => (
                    <ClientCard key={partner.id} client={partner} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TabbedClients;