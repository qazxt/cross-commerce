import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">{t('Footer.aboutUs')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  {t('Footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  {t('Footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t('Footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t('Footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('Common.categories')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/clothing" className="hover:text-foreground transition-colors">
                  服装
                </Link>
              </li>
              <li>
                <Link href="/category/shoes" className="hover:text-foreground transition-colors">
                  鞋靴
                </Link>
              </li>
              <li>
                <Link href="/category/bags" className="hover:text-foreground transition-colors">
                  箱包
                </Link>
              </li>
              <li>
                <Link href="/category/accessories" className="hover:text-foreground transition-colors">
                  配饰
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-semibold mb-4">{t('Common.brands')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/brand/nike" className="hover:text-foreground transition-colors">
                  Nike
                </Link>
              </li>
              <li>
                <Link href="/brand/adidas" className="hover:text-foreground transition-colors">
                  Adidas
                </Link>
              </li>
              <li>
                <Link href="/brand/gucci" className="hover:text-foreground transition-colors">
                  Gucci
                </Link>
              </li>
              <li>
                <Link href="/brand/louis-vuitton" className="hover:text-foreground transition-colors">
                  Louis Vuitton
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {t('Footer.disclaimer')}
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            © {new Date().getFullYear()} FindsIndex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
