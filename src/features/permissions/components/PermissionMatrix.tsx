import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BACKOFFICE_SECTIONS, ROLE_ACTIONS } from "@/features/permissions/types";
import type { PermissionMatrix as Matrix } from "@/features/permissions/types";

export type PermissionMatrixProps = {
  value: Matrix;
  onToggle: (section: string, action: string, checked: boolean) => void;
  readOnly?: boolean;
};

export function PermissionMatrix({ value, onToggle, readOnly }: PermissionMatrixProps) {
  const { t } = useTranslation("roles");

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("matrix.section")}</TableHead>
            {ROLE_ACTIONS.map((action) => (
              <TableHead key={action} className="text-center">
                {t(`actionLabels.${action}`)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(BACKOFFICE_SECTIONS).map(([section, actions]) => (
            <TableRow key={section}>
              <TableCell className="font-medium">{t(`sections.${section}`)}</TableCell>
              {ROLE_ACTIONS.map((action) => {
                const available = (actions as readonly string[]).includes(action);
                const checked = value[section]?.[action] === true;
                return (
                  <TableCell key={action} className="text-center">
                    {available ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={checked}
                          disabled={readOnly}
                          onCheckedChange={(next) => onToggle(section, action, next === true)}
                          aria-label={`${t(`sections.${section}`)} — ${t(`actionLabels.${action}`)}`}
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40" aria-hidden>
                        —
                      </span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
