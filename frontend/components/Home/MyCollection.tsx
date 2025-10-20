import { Collection } from "mongoose";
import FilterPanel from "./FilterPanel"
import CollectionCard from "./CollectionCard";

import { useState } from 'react';

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
  const [showFilters, setShowFilters] = useState(false);
 
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bungee font-bold text-[var(--color-orange)]">
          My Collection
        </h1>
        <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] border border-transparent hover:border-[var(--color-orange)] transition font-bungee"
        onClick={() => setShowFilters(!showFilters)}>
          Show Filters
        </button>
      </div>
      
      {/*Filter Panel*/}
      {showFilters && <FilterPanel/>}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search scholarly articles, topics, or papers..."
          className="w-full md:flex-1 p-3 rounded-lg border border-neutral-700 bg-neutral-900 focus:outline-none focus:border-[var(--color-orange)] placeholder-[var(--color-light)]"
        />
        <button className="px-6 py-2 rounded-lg bg-[var(--color-orange)] text-[var(--color-light)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] border border-transparent font-bungee transition">
          Search
        </button>
      </div>

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
