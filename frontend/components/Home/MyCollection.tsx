import CollectionCard from "./CollectionCard";
import SearchBar from "./SearchBar";

const sampleCollection = [
  {
    title: "Deep Learning Foundations",
    description:
      "A curated collection of research papers exploring neural networks, gradient optimization, and model training fundamentals.",
    date: "March 15, 2023",
    noOfItems: 10
  },
  {
    title: "Natural Language Processing with Transformers",
    description:
      "Contains breakthrough papers related to transformer architectures like BERT, GPT, and T5, focusing on language understanding and generation.",
    date: "June 1, 2024",
    noOfItems: 15
  },
  {
    title: "Computer Vision Essentials",
    description:
      "Research studies covering convolutional neural networks (CNNs), image classification, object detection, and vision transformers.",
    date: "January 5, 2022",
    noOfItems: 8
  },
  {
    title: "Optimization in Machine Learning",
    description:
      "Papers focused on optimization strategies such as stochastic gradient descent, Adam, and second-order optimization techniques.",
    date: "August 20, 2023",
    noOfItems: 12
  },
  {
    title: "Ethics and AI Safety",
    description:
      "A collection discussing responsible AI deployment, bias mitigation, fairness in models, and alignment challenges.",
    date: "October 10, 2024",
    noOfItems: 10
  }
];


export default function MyCollection() {
    
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bungee font-bold text-[var(--color-orange)]">
          My-Collection
        </h1>
        <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] transition font-bungee cursor-pointer"
        onClick={() => {}}>+ Create
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar/>

      <div className='grid grid-cols-2 gap-4 mt-4'>
        {sampleCollection.map((collection) => (
          <CollectionCard
            key={collection.title}
            title={collection.title}
            description={collection.description}
            noOfItems={collection.noOfItems}
            createdAt={new Date()}
          />
        ))}
      </div>

    </main>
  );
}
