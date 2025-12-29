import React, { useState, useEffect } from 'react';
import { Location, LocationInput } from '../types/api';
import { Plus, Edit2, Trash2, MapPin, ChevronRight, ChevronDown, Building2, Layers, Grid } from 'lucide-react';
import { ManagerHeader, EmptyState, ActionButton } from './shared';

interface LocationManagerProps {
  onClose: () => void;
  onSelectLocation?: (location: Location) => void;
}

const getLocationTypeIcon = (type: string | null) => {
  switch (type) {
    case 'building':
      return <Building2 size={16} />;
    case 'floor':
      return <Layers size={16} />;
    case 'room':
      return <Grid size={16} />;
    default:
      return <MapPin size={16} />;
  }
};

const getLocationTypeLabel = (type: string | null): string => {
  const labels: Record<string, string> = {
    'building': 'Building',
    'floor': 'Floor',
    'room': 'Room',
    'area': 'Area',
    'custom': 'Custom',
  };
  return type ? labels[type] || 'Unknown' : 'Unspecified';
};

interface LocationTreeItemProps {
  location: Location & { children?: Location[] };
  level: number;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onSelect?: (location: Location) => void;
}

const LocationTreeItem: React.FC<LocationTreeItemProps> = ({ location, level, onEdit, onDelete, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = location.children && location.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md group transition-colors`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Icon */}
        <div className="text-blue-600">
          {getLocationTypeIcon(location.location_type)}
        </div>

        {/* Name and Type */}
        <div
          className="flex-1 flex items-center gap-2 cursor-pointer"
          onClick={() => onSelect?.(location)}
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">{location.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">({getLocationTypeLabel(location.location_type)})</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            icon={<Edit2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(location);
            }}
            variant="primary"
            size="sm"
            title="Edit"
            className="!p-1.5"
          />
          <ActionButton
            icon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(location);
            }}
            variant="danger"
            size="sm"
            title="Delete"
            className="!p-1.5"
          />
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {location.children!.map((child) => (
            <LocationTreeItem
              key={child.id}
              location={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LocationManager: React.FC<LocationManagerProps> = ({ onClose, onSelectLocation }) => {
  const [locationTree, setLocationTree] = useState<(Location & { children?: Location[] })[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationInput>({
    name: '',
    parent_location_id: null,
    location_type: 'building',
    address: '',
    description: '',
    notes: '',
    active: 1,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const hierarchy = await window.api.getLocationHierarchy();
      setLocationTree(hierarchy);

      // Also get flat list for parent selection
      const flat = await window.api.getLocations();
      setAllLocations(flat.filter(l => l.active === 1));
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLocation) {
        await window.api.updateLocation(editingLocation.id, formData);
      } else {
        await window.api.createLocation(formData);
      }

      await loadLocations();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save location:', error);
      alert(error.message || 'Failed to save location');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent_location_id: null,
      location_type: 'building',
      address: '',
      description: '',
      notes: '',
      active: 1,
    });
    setEditingLocation(null);
    setShowForm(false);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      parent_location_id: location.parent_location_id,
      location_type: location.location_type || 'building',
      address: location.address || '',
      description: location.description || '',
      notes: location.notes || '',
      active: location.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"? This will also delete all sub-locations.`)) return;

    try {
      await window.api.deleteLocation(location.id);
      await loadLocations();
    } catch (error: any) {
      alert(error.message || 'Failed to delete location');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <ManagerHeader
        title="Location Management"
        subtitle="Manage organizational locations and hierarchy"
        icon={<MapPin size={24} />}
        gradientFrom="blue-600"
        gradientTo="cyan-600"
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Location
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingLocation ? 'Edit Location' : 'New Location'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Type
                </label>
                <select
                  value={formData.location_type || 'building'}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="building">Building</option>
                  <option value="floor">Floor</option>
                  <option value="room">Room</option>
                  <option value="area">Area</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Parent Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Location
                </label>
                <select
                  value={formData.parent_location_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_location_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">None (Top Level)</option>
                  {allLocations
                    .filter(loc => !editingLocation || loc.id !== editingLocation.id)
                    .map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({getLocationTypeLabel(loc.location_type)})
                      </option>
                    ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Physical address"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Brief description"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingLocation ? 'Update Location' : 'Create Location'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Location Tree */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Location Hierarchy</h3>

          {locationTree.length === 0 && !showForm ? (
            <EmptyState
              icon={<MapPin size={48} />}
              title="No locations found"
              description="Click 'Add Location' to create one."
            />
          ) : (
            <div className="space-y-1">
              {locationTree.map((location) => (
                <LocationTreeItem
                  key={location.id}
                  location={location}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={onSelectLocation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
