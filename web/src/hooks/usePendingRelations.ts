import { useState } from 'react';

export const usePendingRelations = <TAdd = string>(
  options?: { getId?: (item: TAdd) => string }
) => {
  const [pendingAdds, setPendingAdds] = useState<TAdd[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<string[]>([]);

  const getId = options?.getId ?? (item => item as string);

  const addItem = (item: TAdd) => {
    if (pendingRemoves.includes(getId(item))) {
      setPendingRemoves(prev => prev.filter(id => id !== getId(item)));
    } else {
      setPendingAdds(prev => [...prev, item]);
    }
  };

  const removeItem = (id: string) => {
    if (pendingAdds.some(item => getId(item) === id)) {
      setPendingAdds(prev => prev.filter(item => getId(item) !== id));
    } else {
      setPendingRemoves(prev => [...prev, id]);
    }
  };

  const commitChanges = async <TResult>(
    onCommitAdd: (item: TAdd) => Promise<TResult>,
    onCommitRemove: (id: string) => Promise<TResult>
  ) => {
    const [added, removed] = await Promise.all([
      Promise.all(pendingAdds.map(item => onCommitAdd(item))),
      Promise.all(pendingRemoves.map(id => onCommitRemove(id)))
    ]);
    return { added, removed };
  };

  // A reset function isn't strictly necessary since component remounts on change of drawer mode or record
  // const reset = () => {
  //   setPendingAdds([]);
  //   setPendingRemoves([]);
  // };

  return {
    pendingAdds,
    pendingRemoves,
    addItem,
    removeItem,
    commitChanges,
    hasPendingChanges: pendingAdds.length > 0 || pendingRemoves.length > 0
  };
};
