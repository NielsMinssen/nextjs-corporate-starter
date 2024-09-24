"use client"
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

interface GPU {
  id: number;
  videocard_name: string;
  price: number;
  g3d_mark: number;
  videocard_value: number;
  g2d_mark: number;
  tdp: number;
  power_perf: number;
  vram: number;
  test_date: string;
  category: string;
}

const GPUPage = () => {
  const { t } = useTranslation();
  const [gpuList, setGpuList] = useState<GPU[]>([]);
  const [gpu1, setGpu1] = useState<string | null>(null);
  const [gpu2, setGpu2] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<GPU[] | null>(null);

  useEffect(() => {
    const fetchGPUs = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/gpus');  // Adjust to your Strapi URL
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result);  // Inspect the output here
        if (result.data) {
          setGpuList(result.data.map((item: any) => ({
            id: item.id,
            ...item.attributes.GPU,
          })));
        }
      } catch (error) {
        console.error('Error fetching GPU data:', error);
      }
    };
    fetchGPUs();
  }, []);

  // Handle GPU comparison
  const compareGPUs = () => {
    const selectedGpu1 = gpuList.find((gpu) => gpu.videocard_name === gpu1);
    const selectedGpu2 = gpuList.find((gpu) => gpu.videocard_name === gpu2);

    if (selectedGpu1 && selectedGpu2) {
      setComparisonResult([selectedGpu1, selectedGpu2]);
    }
  };

  return (
    <div>
      <h1>{t('gpuComparison.title')}</h1>
      <p>{t('gpuComparison.description')}</p>
      <div>
        <label>{t('gpuComparison.selectGPU1')}</label>
        <select value={gpu1 ?? ''} onChange={(e) => setGpu1(e.target.value)}>
          <option value="">{t('gpuComparison.select')}</option>
          {gpuList.map((gpu) => (
            <option key={gpu.id} value={gpu.videocard_name}>
              {gpu.videocard_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>{t('gpuComparison.selectGPU2')}</label>
        <select value={gpu2 ?? ''} onChange={(e) => setGpu2(e.target.value)}>
          <option value="">{t('gpuComparison.select')}</option>
          {gpuList.map((gpu) => (
            <option key={gpu.id} value={gpu.videocard_name}>
              {gpu.videocard_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={compareGPUs}>{t('gpuComparison.compareButton')}</button>
      </div>
      {comparisonResult && (
        <table>
          <thead>
            <tr>
              <th>{t('gpuComparison.attribute')}</th>
              <th>{gpu1}</th>
              <th>{gpu2}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('gpuComparison.videocard_name')}</td>
              <td>{comparisonResult[0].videocard_name}</td>
              <td>{comparisonResult[1].videocard_name}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.price')}</td>
              <td>{comparisonResult[0].price}</td>
              <td>{comparisonResult[1].price}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.g3d_mark')}</td>
              <td>{comparisonResult[0].g3d_mark}</td>
              <td>{comparisonResult[1].g3d_mark}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.videocard_value')}</td>
              <td>{comparisonResult[0].videocard_value}</td>
              <td>{comparisonResult[1].videocard_value}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.g2d_mark')}</td>
              <td>{comparisonResult[0].g2d_mark}</td>
              <td>{comparisonResult[1].g2d_mark}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.tdp')}</td>
              <td>{comparisonResult[0].tdp}</td>
              <td>{comparisonResult[1].tdp}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.power_perf')}</td>
              <td>{comparisonResult[0].power_perf}</td>
              <td>{comparisonResult[1].power_perf}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.vram')}</td>
              <td>{comparisonResult[0].vram}</td>
              <td>{comparisonResult[1].vram}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.test_date')}</td>
              <td>{comparisonResult[0].test_date}</td>
              <td>{comparisonResult[1].test_date}</td>
            </tr>
            <tr>
              <td>{t('gpuComparison.category')}</td>
              <td>{comparisonResult[0].category}</td>
              <td>{comparisonResult[1].category}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GPUPage;
