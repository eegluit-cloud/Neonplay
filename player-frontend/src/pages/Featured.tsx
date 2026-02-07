import { CategoryGamePage } from '@/components/CategoryGamePage';

const Featured = () => (
  <CategoryGamePage
    title="Featured"
    activeTab="featured"
    filterFn={(game) => game.isFeatured}
    emptyMessage="No featured games found"
  />
);

export default Featured;
