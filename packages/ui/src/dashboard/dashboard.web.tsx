import * as React from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../components/index.web";
import { SearchIcon } from "../icons/index.web";
import { H2 } from "../typography/typography.web";
import type { DashboardViewProps } from "./dashboard.shared";

export function DashboardView({
    metrics,
    updates,
    chartData,
    chartTitle = "Repository Activity",
    chartDescription = "Recent repository activity from GitHub.",
    latestReleaseLabel = "GitHub",
    searchValue,
    onSearchChange,
    componentResults = [],
    showBranding = true,
    onDocumentationClick,
    onRepositoryClick,
}: DashboardViewProps) {
    const hasSearch = searchValue.length > 0;

    return (
        <div className="flex min-h-full w-full flex-col bg-background">
            <header className="relative z-10 flex min-h-16 flex-col gap-3 border-b border-border/50 bg-surface/50 px-4 py-3 backdrop-blur-xl md:flex-row md:items-center md:px-6">
                {showBranding ? (
                    <div className="text-lg font-semibold tracking-tight text-foreground md:mr-8">
                        Synthex UI
                    </div>
                ) : null}
                <div className="flex w-full flex-1 items-center md:w-auto">
                    <div className="relative w-full md:max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                        <Input
                            placeholder="Search components, tokens, or hooks..."
                            className="h-9 rounded-full border-border/50 bg-surface/50 pl-9 transition-all focus-visible:ring-1 focus-visible:ring-primary/50"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">
                    <Button variant="outline" size="sm" className="hidden h-9 border-border/50 glass-premium md:flex">
                        <span className="mr-2 opacity-50">{latestReleaseLabel}</span> Live Data
                    </Button>
                    <Button variant="default" size="sm" className="h-9 w-full shadow-sm shadow-primary/20 md:w-auto" onClick={onDocumentationClick}>
                        View Documentation
                    </Button>
                </div>
            </header>

            <main className="flex-1 space-y-6 overflow-y-auto p-4 pt-4 md:space-y-8 md:p-8 md:pt-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <H2 className="m-0 border-none text-3xl font-bold tracking-tight">
                        {hasSearch ? "Search Results" : "Dashboard"}
                    </H2>
                </div>

                {hasSearch && componentResults.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Matching Components</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {componentResults.map((comp, i) => (
                                <Card key={i} className="glass-premium group cursor-pointer overflow-hidden border-border/50 hover-premium">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base transition-colors group-hover:text-primary">{comp.name}</CardTitle>
                                        <CardDescription className="line-clamp-1 text-xs">{comp.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {(!hasSearch || metrics.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric, i) => (
                            <Card key={i} className="glass-premium group relative overflow-hidden border-border/50 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                                <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground-muted">{metric.label}</CardTitle>
                                    <span className="text-foreground-muted grayscale transition-all group-hover:grayscale-0">{metric.icon}</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metric.value}</div>
                                    {metric.description && (
                                        <p className="mt-1 text-xs text-foreground-muted">
                                            {metric.trend && (
                                                <span className={metric.trend.type === "positive" ? "mr-1 font-medium text-emerald-500" : "mr-1 font-medium text-rose-500"}>
                                                    {metric.trend.value}
                                                </span>
                                            )}
                                            {metric.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!hasSearch && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="glass-premium border-border/50 shadow-sm lg:col-span-4">
                            <CardHeader>
                                <CardTitle>{chartTitle}</CardTitle>
                                <CardDescription>{chartDescription}</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="mt-4 flex h-[300px] w-full items-end justify-between gap-2 px-4 pb-4">
                                    {chartData.map((data) => (
                                        <div key={data.month} className="group flex w-full flex-col items-center justify-end">
                                            <div
                                                className="w-full rounded-t-sm bg-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(var(--sx-primary-rgb),0.3)]"
                                                style={{ height: `${data.value}%` }}
                                            />
                                            <span className="mt-2 text-[10px] font-medium text-foreground-muted opacity-50 group-hover:opacity-100">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-premium flex flex-col overflow-hidden border-border/50 shadow-sm lg:col-span-3">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-1">
                                    <CardTitle>Recent Updates</CardTitle>
                                    <CardDescription>
                                        Latest commits and merges to the main branch.
                                    </CardDescription>
                                </div>
                                <Button size="sm" variant="outline" className="ml-auto hidden gap-1 border-border/50 bg-surface/50 lg:flex" onClick={onRepositoryClick}>
                                    View Repository
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto px-6 p-0">
                                <Table>
                                    <TableBody>
                                        {updates.map((update, i) => (
                                            <TableRow key={i} className="group border-border/30 transition-colors hover:bg-surface-muted/30">
                                                <TableCell className="w-[50px] py-4">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-surface-muted text-xs font-semibold transition-colors group-hover:border-primary/50">
                                                        {update.initials}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="font-medium transition-colors group-hover:text-primary">{update.title}</div>
                                                    <div className="text-sm text-foreground-muted">by @{update.user}</div>
                                                </TableCell>
                                                <TableCell className="py-4 text-right text-sm text-foreground-muted opacity-70">
                                                    {update.time}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {hasSearch && updates.length > 0 && (
                    <Card className="glass-premium mt-8 flex flex-col overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center border-b border-border/30 bg-surface-muted/10">
                            <CardTitle className="text-base">Matching Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {updates.map((update, i) => (
                                        <TableRow key={i} className="group border-border/30 transition-colors hover:bg-surface-muted/30">
                                            <TableCell className="w-[50px] px-6 py-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-surface-muted text-xs font-semibold transition-colors group-hover:border-primary/50">
                                                    {update.initials}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-medium transition-colors group-hover:text-primary">{update.title}</div>
                                                <div className="text-sm text-foreground-muted">by @{update.user}</div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right text-sm text-foreground-muted opacity-70">
                                                {update.time}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {hasSearch && componentResults.length === 0 && metrics.length === 0 && updates.length === 0 && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                            <SearchIcon className="h-6 w-6 text-foreground-muted opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">No results found</h3>
                            <p className="max-w-sm text-foreground-muted">No components, metrics, or updates matched your search for "{searchValue}".</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onSearchChange("")}>Clear Search</Button>
                    </div>
                )}
            </main>
        </div>
    );
}
