import { CategoryGamePage } from '@/components/CategoryGamePage';

const NewReleases = () => (
  <CategoryGamePage
    title="New Releases"
    activeTab="new-releases"
    filterFn={(game) => game.isNew}
    emptyMessage="No new releases found"
  />
);

export default NewReleases;
