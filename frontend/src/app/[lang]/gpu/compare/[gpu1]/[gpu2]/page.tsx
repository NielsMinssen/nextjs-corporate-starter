import React from 'react';
import GPUComparison from '@/app/[lang]/components/GPUComparison';

export default function ComparisonPage({ params }: { params: { lang: string; gpu1: string; gpu2: string } }) {
    console.log(params)
  return (
    <GPUComparison
      initialGpu1={decodeURIComponent(params.gpu1)}
      initialGpu2={decodeURIComponent(params.gpu2)}
      lang={params.lang}
    />
  );
}