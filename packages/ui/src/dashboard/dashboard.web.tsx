import * as React from "react";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../components/index.web";
import { SearchIcon } from "../icons/index.web";
import { Inline, Stack, Surface, Text } from "../primitives/index.web";
import { H2 } from "../typography/typography.web";
import type { DashboardViewProps } from "./dashboard.shared";

export function DashboardView({
    metrics,
    updates,
    chartData,
    onDocumentationClick,
    onRepositoryClick,
}: DashboardViewProps) {
    return (
        <Stack grow gap="xl" padding="xl" background="background">
            <Surface tone="raised" border padding="md" radius="xl" style={{ backdropFilter: "blur(20px)" }}>
                <Inline align="center" justify="space-between" gap="md">
                    <Inline align="center" gap="lg" grow>
                        <Text size="lg" weight="bold" style={{ letterSpacing: "-0.02em" }}>Synthex UI</Text>
                        <Surface tone="muted" radius="pill" paddingX="md" paddingY="xs" width={400}>
                            <Inline align="center" gap="sm">
                                <SearchIcon size={16} color="var(--sx-color-foreground-muted)" />
                                <Input
                                    placeholder="Search components, tokens, or hooks..."
                                    style={{ height: 32, padding: 0, border: "none", background: "transparent" }}
                                />
                            </Inline>
                        </Surface>
                    </Inline>
                    <Inline align="center" gap="md">
                        <Button variant="outline" size="sm" style={{ height: 36 }}>
                            <Text size="xs" tone="muted" style={{ marginRight: 8 }}>v1.0.4</Text> Latest Release
                        </Button>
                        <Button variant="default" size="sm" style={{ height: 36 }} onClick={onDocumentationClick}>
                            View Documentation
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" style={{ height: 36, width: 36, borderRadius: 999 }}>
                                    <Text weight="semibold" size="xs">SU</Text>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Developer Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem>API Tokens</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Inline>
                </Inline>
            </Surface>

            <Stack gap="md">
                <H2 style={{ border: "none", margin: 0 }}>Dashboard</H2>
            </Stack>

            {/* Metrics Grid */}
            <Inline gap="md" wrap>
                {metrics.map((metric, i) => (
                    <Surface
                        key={i}
                        tone="raised"
                        padding="lg"
                        radius="lg"
                        grow
                        basis="200px"
                        style={{ position: "relative", overflow: "hidden" }}
                    >
                        <Surface
                            tone="transparent"
                            style={{
                                position: "absolute",
                                top: -20,
                                right: -20,
                                width: 100,
                                height: 100,
                                backgroundColor: "var(--sx-color-primary)",
                                opacity: 0.05,
                                borderRadius: 50,
                                filter: "blur(40px)",
                            }}
                        />
                        <Stack gap="sm">
                            <Inline justify="space-between" align="center">
                                <Text size="sm" tone="muted">
                                    {metric.label}
                                </Text>
                                <Text size="lg">{metric.icon}</Text>
                            </Inline>
                            <Stack gap="xs">
                                <Text size="2xl" weight="bold">{metric.value}</Text>
                                {metric.description ? (
                                    <Inline gap="xs" align="center">
                                        {metric.trend ? (
                                            <Text size="xs" weight="medium" style={{ color: metric.trend.type === "positive" ? "#10b981" : "inherit" }}>
                                                {metric.trend.value}
                                            </Text>
                                        ) : null}
                                        <Text size="xs" tone="muted">
                                            {metric.description}
                                        </Text>
                                    </Inline>
                                ) : null}
                            </Stack>
                        </Stack>
                    </Surface>
                ))}
            </Inline>

            {/* Charts and Tables */}
            <Inline gap="md" wrap align="stretch">
                <Surface tone="raised" padding="lg" radius="lg" style={{ flex: 4, minWidth: 400 }}>
                    <Stack gap="lg">
                        <Stack gap="xs">
                            <Text weight="semibold" size="lg">Usage Overview</Text>
                            <Text size="sm" tone="muted">
                                Monthly NPM downloads over the current year.
                            </Text>
                        </Stack>
                        <Inline align="flex-end" justify="space-between" gap="sm" style={{ height: 200, paddingBottom: 20 }}>
                            {chartData.map((data) => (
                                <Stack key={data.month} grow gap="sm" align="center" style={{ minWidth: 0 }}>
                                    <Surface
                                        tone="accent"
                                        radius="sm"
                                        width="100%"
                                        style={{
                                            height: `${data.value}%`,
                                            opacity: 0.2,
                                            minHeight: 4,
                                            transition: "opacity 0.2s",
                                        }}
                                    />
                                    <Text size="xs" weight="medium" tone="muted">
                                        {data.month}
                                    </Text>
                                </Stack>
                            ))}
                        </Inline>
                    </Stack>
                </Surface>

                <Surface tone="raised" padding={0} radius="lg" style={{ flex: 3, minWidth: 320, overflow: "hidden" }}>
                    <Stack>
                        <Surface tone="transparent" padding="lg">
                            <Inline justify="space-between" align="center">
                                <Stack gap="xs">
                                    <Text weight="semibold" size="lg">Recent Updates</Text>
                                    <Text size="sm" tone="muted">
                                        Latest commits and merges.
                                    </Text>
                                </Stack>
                                <Button variant="outline" size="sm" onClick={onRepositoryClick}>
                                    View Repository
                                </Button>
                            </Inline>
                        </Surface>
                        <Table>
                            <TableBody>
                                {updates.map((update, i) => (
                                    <TableRow key={i} style={{ borderBottom: "1px solid var(--sx-color-border-subtle)" }}>
                                        <TableCell style={{ width: 60, paddingLeft: 24 }}>
                                            <Surface
                                                tone="muted"
                                                radius="pill"
                                                width={36}
                                                height={36}
                                                align="center"
                                                justify="center"
                                            >
                                                <Text size="xs" weight="bold">{update.initials}</Text>
                                            </Surface>
                                        </TableCell>
                                        <TableCell>
                                            <Stack gap="xs">
                                                <Text size="sm" weight="semibold">{update.title}</Text>
                                                <Text size="xs" tone="muted">
                                                    by @{update.user}
                                                </Text>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right" style={{ paddingRight: 24 }}>
                                            <Text size="xs" tone="muted">
                                                {update.time}
                                            </Text>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Stack>
                </Surface>
            </Inline>
        </Stack>
    );
}
