export const createMetadata = (uid: string) => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
  };
};

export const updateMetadata = (uid: string) => {
  return {
    updatedAt: new Date().toISOString(),
    updatedBy: uid,
  };
};

export const createSoftDelete = () => {
  return {
    isActive: true,
    archivedAt: null,
    deletedAt: null,
  };
};
