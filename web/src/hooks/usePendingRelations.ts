import { useState } from 'react';

type UsePendingRelationsOptions<TAdd> = {
  getIdFromAdd: (add: TAdd) => number;
};

export const usePendingRelations = <TAdd>({ getIdFromAdd }: UsePendingRelationsOptions<TAdd>) => {
  const [pendingAdds, setPendingAdds] = useState<TAdd[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<number[]>([]);

  const addItem = (item: TAdd) => {
    if (pendingRemoves.includes(getIdFromAdd(item))) {
      setPendingRemoves(prev => prev.filter(id => id !== getIdFromAdd(item)));
    } else {
      setPendingAdds(prev => [...prev, item]);
    }
  };

  const removeItem = (id: number) => {
    if (pendingAdds.some(item => getIdFromAdd(item) === id)) {
      setPendingAdds(prev => prev.filter(item => getIdFromAdd(item) !== id));
    } else {
      setPendingRemoves(prev => [...prev, id]);
    }
  };

  const commitChanges = async (
    onCommitAdd: (item: TAdd) => Promise<void>,
    onCommitRemove: (id: number) => Promise<void>
  ) => {
    await Promise.all([
      ...pendingAdds.map(item => onCommitAdd(item)),
      ...pendingRemoves.map(id => onCommitRemove(id))
    ]);
    reset();
  };

  const reset = () => {
    setPendingAdds([]);
    setPendingRemoves([]);
  };

  return {
    pendingAdds,
    pendingRemoves,
    addItem,
    removeItem,
    commitChanges,
    reset,
    hasPendingChanges: pendingAdds.length > 0 || pendingRemoves.length > 0
  };
};
