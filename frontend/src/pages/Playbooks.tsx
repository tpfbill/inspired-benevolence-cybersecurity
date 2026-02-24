import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import apiClient from '../api/client';

export default function Playbooks() {
  const { data: playbooks, isLoading } = useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const response = await apiClient.get('/api/playbooks');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Incident Response Playbooks</h1>
        <Link to="/playbooks/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Playbook
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading playbooks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playbooks?.map((playbook: any) => (
            <Link
              key={playbook.id}
              to={`/playbooks/${playbook.id}`}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start">
                <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {playbook.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {playbook.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`badge badge-${playbook.status === 'active' ? 'low' : 'medium'}`}>
                      {playbook.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {playbook.steps.length} steps
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Type: {playbook.incidentType}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
