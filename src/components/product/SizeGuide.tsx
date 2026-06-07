'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ruler, X } from 'lucide-react';

interface SizeGuideProps {
  category?: string;
  sizes?: string[];
}

export function SizeGuide({ category = '服装', sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 尺码数据表
  const sizeData: Record<string, { sizes: string[]; measurements: { name: string; unit: string; values: string[] }[] }> = {
    '服装': {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: [
        { name: '胸围', unit: 'cm', values: ['82-86', '86-90', '90-94', '94-98', '98-102', '102-106'] },
        { name: '腰围', unit: 'cm', values: ['66-70', '70-74', '74-78', '78-82', '82-86', '86-90'] },
        { name: '臀围', unit: 'cm', values: ['88-92', '92-96', '96-100', '100-104', '104-108', '108-112'] },
        { name: '衣长', unit: 'cm', values: ['65', '67', '69', '71', '73', '75'] },
      ]
    },
    '裤子': {
      sizes: ['28', '30', '32', '34', '36', '38'],
      measurements: [
        { name: '腰围', unit: 'cm', values: ['71-74', '76-79', '81-84', '86-89', '91-94', '96-99'] },
        { name: '臀围', unit: 'cm', values: ['90-93', '95-98', '100-103', '105-108', '110-113', '115-118'] },
        { name: '裤长', unit: 'cm', values: ['99', '101', '103', '105', '107', '109'] },
      ]
    },
    '鞋': {
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
      measurements: [
        { name: '脚长', unit: 'cm', values: ['22.5', '23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27'] },
      ]
    }
  };

  const data = sizeData[category] || sizeData['服装'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          尺码指南
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>尺码指南 - {category}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* 尺码表 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">尺码</th>
                  {data.measurements.map((m, i) => (
                    <th key={i} className="border p-2 text-center">{m.name} ({m.unit})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sizes.map((size, i) => (
                  <tr key={size} className="hover:bg-muted/50">
                    <td className="border p-2 font-medium text-center">{size}</td>
                    {data.measurements.map((m, j) => (
                      <td key={j} className="border p-2 text-center">
                        {m.values[i] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 测量说明 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">测量方法</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 胸围：腋下最宽处水平环绕测量</li>
              <li>• 腰围：腰部最窄处水平环绕测量</li>
              <li>• 臀围：臀部最宽处水平环绕测量</li>
              <li>• 衣长/裤长：从领口/腰头到下摆的垂直距离</li>
            </ul>
          </div>

          {/* 温馨提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">温馨提示</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 不同品牌尺码可能存在差异，建议参照具体商品详情</li>
              <li>• 手工测量可能存在1-2cm误差</li>
              <li>• 建议结合身高体重选择合适尺码</li>
            </ul>
          </div>
        </div>

        <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full mt-4">
          关闭
        </Button>
      </DialogContent>
    </Dialog>
  );
}