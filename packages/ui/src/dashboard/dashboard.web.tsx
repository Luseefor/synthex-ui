import * as React from "react";
import { Badge } from "../badge/badge.web";
import { Button } from "../button/button.web";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card.web";
import { Input } from "../input/input.web";
import { SearchIcon } from "../icons/index.web";
import { H2 } from "../typography/typography.web";
import type { DashboardUpdate, DashboardViewProps } from "./dashboard.shared";

function clampPercent(value: number): number {
    if (!Number.isFinite(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 100) return 100;
    return value;
}

function UpdateList({
    updates,
    onUpdateClick,
}: {
    readonly updates: readonly DashboardUpdate[];
    readonly onUpdateClick?: (update: DashboardUpdate) => void;
}) {
    return (
        <ul className="flex w-full max-w-full flex-col divide-y divide-border">
            {updates.map((update, i) => {
                const content = (
                    <>
                        <div
                            aria-hidden="true"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-muted-foreground"
                        >
                            {update.initials}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p
                                title={update.title}
                                className="line-clamp-2 w-full min-w-0 text-sm font-medium leading-snug break-words"
                                style={{ overflowWrap: "anywhere" }}
                            >
                                {update.title}
                            </p>
                            <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                <span className="min-w-0 truncate">by @{update.user}</span>
                                <span className="shrink-0 whitespace-nowrap">{update.time}</span>
                            </p>
                        </div>
                    </>
                );
                if (onUpdateClick) {
                    const current = update;
                    return (
                        <li key={i} className="min-w-0">
                            <button
                                type="button"
                                onClick={() => onUpdateClick(current)}
                                className="flex w-full min-w-0 cursor-pointer items-start gap-3 py-3 text-left transition-colors hover:bg-muted/50"
                            >
                                {content}
                            </button>
                        </li>
                    );
                }
                return (
                    <li key={i} className="flex w-full min-w-0 items-start gap-3 py-3">
                        {content}
                    </li>
                );
            })}
        </ul>
    );
}

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
    onUpdateClick,
}: DashboardViewProps) {
    const searchId = React.useId();
    const hasSearch = searchValue.length > 0;
    const isChartEmpty =
        chartData.length === 0 ||
        chartData.every((data) => !Number.isFinite(data.value) || data.value <= 0);

    return (
        <section
            data-slot="dashboard"
            aria-label={hasSearch ? "Search Results" : "Overview"}
            className="flex w-full min-w-0 max-w-full flex-col gap-5 bg-background p-4 md:p-6"
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-1">
                        {showBranding ? (
                            <p className="text-sm font-semibold tracking-tight text-foreground">
                                Synthex UI
                            </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                            <H2 className="m-0 border-none text-2xl font-bold tracking-tight">
                                {hasSearch ? "Search Results" : "Overview"}
                            </H2>
                            <Badge variant="secondary" className="shrink-0">
                                {latestReleaseLabel}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {hasSearch
                                ? `Showing matches for "${searchValue}".`
                                : "Repository activity and recent changes."}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 flex-1 sm:flex-none"
                            onClick={onDocumentationClick}
                        >
                            View Documentation
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 flex-1 sm:flex-none"
                            onClick={onRepositoryClick}
                        >
                            View Repository
                        </Button>
                    </div>
                </div>
                <div className="relative w-full md:max-w-md">
                    <SearchIcon
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <label htmlFor={searchId} className="sr-only">
                        Search overview
                    </label>
                    <Input
                        id={searchId}
                        placeholder="Search components and activity..."
                        className="h-9 pl-9"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {hasSearch && componentResults.length > 0 && (
                <div className="flex min-w-0 flex-col gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Matching Components
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {componentResults.map((comp, i) => (
                            <Card key={i} className="min-w-0">
                                <CardHeader className="px-4">
                                    <CardTitle className="break-words text-base">{comp.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 break-words text-xs">
                                        {comp.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {(!hasSearch || metrics.length > 0) && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {metrics.map((metric, i) => (
                        <Card key={i} className="min-w-0 gap-3 py-4">
                            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4">
                                <CardTitle className="min-w-0 break-words text-sm font-medium text-muted-foreground">
                                    {metric.label}
                                </CardTitle>
                                <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                                    {metric.icon}
                                </span>
                            </CardHeader>
                            <CardContent className="px-4">
                                <div className="truncate text-xl font-bold sm:text-2xl">{metric.value}</div>
                                {metric.description && (
                                    <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">
                                        {metric.trend && (
                                            <span
                                                className="mr-1 font-medium text-foreground"
                                            >
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
                <div className="grid gap-4 xl:grid-cols-7">
                    <Card className="min-w-0 xl:col-span-4">
                        <CardHeader className="px-4">
                            <CardTitle className="break-words">{chartTitle}</CardTitle>
                            <CardDescription className="break-words">{chartDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex min-h-56 flex-1 flex-col px-4 md:min-h-64">
                            {isChartEmpty ? (
                                <div className="flex min-h-56 flex-1 items-center justify-center md:min-h-64">
                                    <p className="text-sm text-muted-foreground">No activity to show.</p>
                                </div>
                            ) : (
                                <div data-slot="dashboard-chart" className="relative min-h-56 flex-1 md:min-h-64">
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 bottom-7 top-0 flex flex-col justify-between"
                                    >
                                        {[0, 1, 2, 3].map((line) => (
                                            <div key={line} className="border-t border-border/40" />
                                        ))}
                                    </div>
                                    <div className="relative flex h-full w-full items-stretch gap-1 sm:gap-2">
                                        {chartData.map((data) => (
                                            <div
                                                key={data.month}
                                                className="flex h-full min-w-0 flex-1 flex-col items-stretch justify-end"
                                            >
                                                <div className="flex min-h-0 w-full flex-1 items-end border-b border-border">
                                                    <div
                                                        data-slot="dashboard-chart-bar"
                                                        className="w-full rounded-t-sm bg-primary"
                                                        style={{ height: `${clampPercent(data.value)}%` }}
                                                    />
                                                </div>
                                                <span className="mt-1 w-full truncate text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
                                                    {data.month}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 xl:col-span-3">
                        <CardHeader className="px-4">
                            <CardTitle>Recent Updates</CardTitle>
                            <CardDescription>
                                Latest commits and merges to the main branch.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4">
                            <UpdateList updates={updates} onUpdateClick={onUpdateClick} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {hasSearch && updates.length > 0 && (
                <Card className="flex min-w-0 flex-col">
                    <CardHeader className="px-4">
                        <CardTitle className="text-base">Matching Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4">
                        <UpdateList updates={updates} onUpdateClick={onUpdateClick} />
                    </CardContent>
                </Card>
            )}

            {hasSearch && componentResults.length === 0 && metrics.length === 0 && updates.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <SearchIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">No results found</h3>
                        <p className="max-w-sm break-words text-muted-foreground">
                            No components, metrics, or updates matched your search for "{searchValue}".
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onSearchChange("")}>
                        Clear Search
                    </Button>
                </div>
            )}
        </section>
    );
}
