"use client";

import { BarChart3, KeyRound, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeForm } from "./_components/AttributeForm";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { ProfileInfoForm } from "./_components/ProfileInfoForm";
import { useProfilePage } from "./hook";

const ProfilePage = () => {
  const s = useProfilePage();

  if (s.isLoading || !s.player) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Hồ sơ của tôi</h1>
        <Badge variant="secondary">{s.player.role === "ADMIN" ? "Quản trị" : "Cầu thủ"}</Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">
            <User className="size-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="attribute">
            <BarChart3 className="size-4" />
            Chỉ số
          </TabsTrigger>
          <TabsTrigger value="password">
            <KeyRound className="size-4" />
            Mật khẩu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProfileInfoForm key={s.player.id} player={s.player} />
        </TabsContent>

        <TabsContent value="attribute">
          {s.isAttributeLoading ? (
            <div className="py-10 text-center text-muted-foreground">Đang tải chỉ số…</div>
          ) : (
            <AttributeForm key={s.player.id} playerId={s.player.id} initial={s.attribute} />
          )}
        </TabsContent>

        <TabsContent value="password">
          <ChangePasswordForm userId={s.player.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
