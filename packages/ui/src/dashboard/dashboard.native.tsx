import * as React from "react";
import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../components/index.native";
import { SearchIcon } from "../icons/index.native";
import { Inline, Stack, Surface, Text } from "../primitives/index.native";
import { H2 } from "../typography/typography.native";
import type { DashboardViewProps } from "./dashboard.shared";

export function DashboardView({
    metrics,
    updates,
    chartData,
    searchValue,
    onSearchChange,
    onDocumentationClick,
    onRepositoryClick,
}: DashboardViewProps) {
    return (
        <Stack grow gap="xl" padding="xl" background="background">
            <Surface tone="raised" border padding="md" radius="xl">
                <Inline align="center" justify="space-between" gap="md">
                    <Inline align="center" gap="lg" grow>
                        <Text size="lg" weight="bold">Synthex</Text>
                        <Surface tone="muted" radius="pill" paddingX="md" paddingY="xs" grow>
                            <Inline align="center" gap="sm">
                                <SearchIcon size={16} color="#71717a" />
                                <Input
                                    placeholder="Search..."
                                    style={{ height: 32, padding: 0, flex: 1 }}
                                    value={searchValue}
                                    onChangeText={onSearchChange}
                                />
                            </Inline>
                        </Surface>
                    </Inline>
                </Inline>
            </Surface>

            <Stack gap="md">
                <H2>Dashboard</H2>
            </Stack>

            {/* Metrics Grid */}
            <Stack gap="md">
                {metrics.map((metric, i) => (
                    <Surface
                        key={i}
                        tone="raised"
                        padding="lg"
                        radius="lg"
                        style={{ position: "relative", overflow: "hidden" }}
                    >
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
                                            <Text size="xs" weight="medium" style={{ color: "#10b981" }}>
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
            </Stack>

            {/* Usage Overview */}
            <Surface tone="raised" padding="lg" radius="lg">
                <Stack gap="lg">
                    <Stack gap="xs">
                        <Text weight="semibold" size="lg">Usage Overview</Text>
                        <Text size="sm" tone="muted">Monthly NPM downloads</Text>
                    </Stack>
                    <Inline align="flex-end" justify="space-between" gap="xs" style={{ height: 120 }}>
                        {chartData.map((data) => (
                            <Stack key={data.month} grow gap="xs" align="center">
                                <Surface
                                    tone="accent"
                                    radius="sm"
                                    width="100%"
                                    style={{
                                        height: `${data.value}%`,
                                        opacity: 0.2,
                                        minHeight: 2,
                                    }}
                                />
                                <Text style={{ fontSize: 8 }} tone="muted">
                                    {data.month}
                                </Text>
                            </Stack>
                        ))}
                    </Inline>
                </Stack>
            </Surface>

            {/* Recent Updates */}
            <Surface tone="raised" padding={0} radius="lg" grow>
                <Stack>
                    <Surface tone="transparent" padding="lg">
                        <Inline justify="space-between" align="center">
                            <Text weight="semibold" size="lg">Recent Updates</Text>
                            <Button variant="outline" size="sm" onPress={onRepositoryClick}>
                                <Text size="xs">Repo</Text>
                            </Button>
                        </Inline>
                    </Surface>
                    <Table>
                        <TableBody>
                            {updates.map((update, i) => (
                                <TableRow key={i}>
                                    <TableCell style={{ width: 60, paddingLeft: 16 }}>
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
                                                @{update.user} • {update.time}
                                            </Text>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Stack>
            </Surface>
        </Stack>
    );
}
