import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, AlertTriangle, Image as ImageIcon, FileText, Save, Loader } from 'lucide-react';
import postStore from '../store/postStore.js';

export default function ManagePostsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { 
    posts, 
    isLoading, 
    error, 
    message, 
    getAllPosts, 
    editPost, 
    deletePost 
  } = postStore()

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      await getAllPosts();
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (post) => {
    setCurrentPost(post);
    setEditedDescription(post.discription || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentPost(null);
    setEditedDescription('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    
    if (!currentPost || !editedDescription.trim()) return;

    setLocalLoading(true);
    try {
      await editPost(currentPost._id, { discription: editedDescription });
      closeEditModal();
      // Refresh posts to get updated data
      await fetchPosts();
    } catch (err) {
      console.error('Error updating post:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteModal = (post) => {
    setCurrentPost(post);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentPost(null);
  };

  const handleDeleteConfirm = async () => {
    if (!currentPost) return;

    setLocalLoading(true);
    try {
      await deletePost(currentPost._id);
      closeDeleteModal();
      // Posts are automatically updated in the store after deletion
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Show loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-6xl sujoy font-bold text-white mb-2">
            Manage Posts
          </h2>
          <p className="text-zinc-400">
            Edit or delete your existing posts.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row border border-zinc-700">
                <img 
                  src={post.img} 
                  alt="Post" 
                  className="w-full md:w-1/3 h-48 md:h-auto object-cover"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/600x400/ff0000/ffffff?text=Image+Failed'; 
                  }}
                />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-zinc-300">{post.discription || 'No description'}</p>
                    <p className="text-zinc-500 text-sm mt-2">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <button
                      onClick={() => openEditModal(post)}
                      disabled={localLoading}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {localLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(post)}
                      disabled={localLoading}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {localLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-zinc-800 rounded-lg border border-zinc-700">
              <ImageIcon className="mx-auto h-12 w-12 text-zinc-500" />
              <h3 className="mt-2 text-xl font-semibold text-white">No posts found</h3>
              <p className="mt-1 text-zinc-400">Upload a new post to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && currentPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleEditSave} className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-2xl w-full max-w-lg relative">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={localLoading}
              className="absolute cursor-pointer top-4 right-4 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Edit Post</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Image
                </label>
                <img 
                  src={currentPost.img} 
                  alt="Post preview" 
                  className="w-full h-64 object-cover rounded-lg bg-zinc-700"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/600x400/ff0000/ffffff?text=Image+Failed'; 
                  }}
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
                  <textarea
                    id="edit-description"
                    rows="4"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    disabled={localLoading}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Write a caption..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={localLoading}
                  className="px-6 py-2 cursor-pointer bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={localLoading || !editedDescription.trim()}
                  className="flex cursor-pointer items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {localLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-2xl w-full max-w-sm">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border border-red-600/30">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Post?</h3>
              <p className="text-zinc-400 mb-8">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={closeDeleteModal}
                  disabled={localLoading}
                  className="px-6 py-2 cursor-pointer bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={localLoading}
                  className="flex cursor-pointer items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {localLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}