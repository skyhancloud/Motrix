import type { MotrixIcon } from '@renderer/components/icons'
import {
  AudioIcon,
  ChevronDownIcon,
  DashboardIcon,
  DocumentIcon,
  DownloadLibraryIcon,
  FilesIcon,
  FolderIcon,
  ImageIcon,
  InstallIcon,
  MigrationIcon,
  PluginIcon,
  SettingsIcon,
  TrackerIcon,
  VideoIcon,
} from '@renderer/components/icons'
import { NotificationsNavItem } from '@renderer/components/notification-center/notifications-nav-item'
import { useDirection } from '@renderer/components/ui/direction'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@renderer/components/ui/sidebar'
import { useLegacyImportNavigation } from '@renderer/features/legacy-import/use-legacy-import-navigation'
import { LEGACY_MIGRATION_ROUTE } from '@shared/lib/legacy-import-navigation'
import {
  DOWNLOAD_CATEGORIES,
  type DownloadCategory,
  downloadCategorySchema,
} from '@shared/schemas/download-category'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router'

const CATEGORY_ICONS: Record<DownloadCategory, MotrixIcon> = {
  compressed: FilesIcon,
  documents: DocumentIcon,
  music: AudioIcon,
  images: ImageIcon,
  programs: InstallIcon,
  video: VideoIcon,
  other: FolderIcon,
}

interface NavItem {
  to: string
  icon: MotrixIcon
  labelKey: string
  end?: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', icon: DashboardIcon, labelKey: 'nav.dashboard', end: true },
  { to: '/downloads', icon: DownloadLibraryIcon, labelKey: 'nav.downloads' },
  { to: '/trackers', icon: TrackerIcon, labelKey: 'nav.trackers' },
  { to: '/plugins', icon: PluginIcon, labelKey: 'nav.plugins' },
] as const

const FOOTER_NAV_ITEMS: readonly NavItem[] = [
  { to: '/settings', icon: SettingsIcon, labelKey: 'nav.settings' },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const direction = useDirection()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const parsedCategory = downloadCategorySchema.safeParse(
    searchParams.get('category')
  )
  const category = parsedCategory.success ? parsedCategory.data : null
  const [categoriesOpen, setCategoriesOpen] = useState(() => category !== null)
  useEffect(() => {
    if (category) setCategoriesOpen(true)
  }, [category])
  const { visible } = useLegacyImportNavigation()
  const items = visible
    ? [
        ...NAV_ITEMS,
        {
          to: LEGACY_MIGRATION_ROUTE,
          icon: MigrationIcon,
          labelKey: 'legacyImport.navigation',
        },
      ]
    : NAV_ITEMS

  return (
    <Sidebar
      variant="inset"
      side={direction === 'rtl' ? 'right' : 'left'}
      {...props}
    >
      <SidebarHeader
        style={{
          height: 45,
        }}
      ></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      aria-current={
                        item.to === '/downloads' && category ? false : undefined
                      }
                      aria-expanded={
                        item.to === '/downloads' ? categoriesOpen : undefined
                      }
                      aria-controls={
                        item.to === '/downloads'
                          ? 'downloads-categories'
                          : undefined
                      }
                      onClick={() => {
                        if (item.to === '/downloads')
                          setCategoriesOpen((open) => !open)
                      }}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton
                          render={<span />}
                          isActive={
                            isActive && (item.to !== '/downloads' || !category)
                          }
                          tooltip={t(item.labelKey)}
                          className="cursor-default"
                        >
                          <Icon />
                          <span className="select-none">
                            {t(item.labelKey)}
                          </span>
                          {item.to === '/downloads' ? (
                            <ChevronDownIcon
                              className={`ml-auto size-4 transition-transform ${
                                categoriesOpen ? 'rotate-180' : ''
                              }`}
                            />
                          ) : null}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                    {item.to === '/downloads' && categoriesOpen ? (
                      <SidebarMenuSub
                        id="downloads-categories"
                        aria-label={t('downloadCategories.label')}
                      >
                        {DOWNLOAD_CATEGORIES.map((key) => {
                          const CategoryIcon = CATEGORY_ICONS[key]
                          const active =
                            location.pathname.startsWith('/downloads') &&
                            category === key
                          return (
                            <SidebarMenuSubItem key={key}>
                              <SidebarMenuSubButton
                                render={
                                  <Link
                                    to={`/downloads/all?category=${key}`}
                                    aria-current={active ? 'page' : undefined}
                                  />
                                }
                                isActive={active}
                              >
                                <CategoryIcon />
                                <span>{t(`downloadCategories.${key}`)}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-0.5">
        <SidebarMenu>
          <NotificationsNavItem />
          <SidebarMenuItem aria-hidden="true">
            <SidebarSeparator className="mx-0" />
          </SidebarMenuItem>
          {FOOTER_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      render={<span />}
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                      className="cursor-default"
                    >
                      <Icon />
                      <span className="select-none">{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
