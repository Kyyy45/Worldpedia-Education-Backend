import { logger } from '../utils/logger';
import { logOAuthEvent } from '../utils/oauth.helper';
import { OAuthAccount as OAuthAccountModel } from '../models/OAuthAccount'; // Gunakan Model DB
import {
  OAuthAccount,
  AccountLinkingResponse,
  AccountListResponse
} from '../types/oauth.types';

export class OAuthService {
  async linkOAuthAccount(
    userId: string,
    provider: string,
    oauthData: any
  ): Promise<AccountLinkingResponse> {
    try {
      // Cek apakah akun OAuth sudah terhubung ke user lain
      const existingLink = await OAuthAccountModel.findOne({ 
        provider, 
        providerId: oauthData.id 
      });

      if (existingLink && existingLink.userId !== userId) {
        throw new Error(`This ${provider} account is already linked to another user`);
      }

      // Update atau Buat record baru di DB (Upsert)
      await OAuthAccountModel.findOneAndUpdate(
        { userId, provider },
        {
          userId,
          provider,
          providerId: oauthData.id,
          email: oauthData.email,
          displayName: oauthData.displayName,
          picture: oauthData.picture,
          accessToken: oauthData.accessToken,
          refreshToken: oauthData.refreshToken,
          connectedAt: oauthData.connectedAt || new Date(),
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      logger.info(`✅ OAuth account linked: ${provider}`, { userId });
      logOAuthEvent('account_linked', provider, userId);

      const linkedAccounts = await this.getLinkedAccounts(userId);

      return {
        success: true,
        message: `${provider} account linked successfully`,
        linkedAccounts
      };
    } catch (error: any) {
      logger.error('Failed to link OAuth account:', error);
      throw error;
    }
  }

  async unlinkOAuthAccount(userId: string, provider: string): Promise<AccountLinkingResponse> {
    try {
      const result = await OAuthAccountModel.deleteOne({ userId, provider });

      if (result.deletedCount === 0) {
        throw new Error(`${provider} account is not linked to this user`);
      }

      logger.info(`✅ OAuth account unlinked: ${provider}`, { userId });
      logOAuthEvent('account_unlinked', provider, userId);

      const linkedAccounts = await this.getLinkedAccounts(userId);

      return {
        success: true,
        message: `${provider} account unlinked successfully`,
        linkedAccounts
      };
    } catch (error: any) {
      logger.error('Failed to unlink OAuth account:', error);
      throw error;
    }
  }

  async getLinkedAccounts(userId: string): Promise<OAuthAccount[]> {
    try {
      const accounts = await OAuthAccountModel.find({ userId });

      const mappedAccounts: OAuthAccount[] = accounts.map(acc => ({
        provider: acc.provider,
        id: acc.providerId,
        email: acc.email,
        displayName: acc.displayName,
        picture: acc.picture,
        connectedAt: acc.connectedAt,
        accessToken: acc.accessToken,
        refreshToken: acc.refreshToken
      }));

      return mappedAccounts;
    } catch (error: any) {
      logger.error('Failed to get linked accounts:', error);
      throw error;
    }
  }

  async getLinkedAccountsWithStatus(userId: string): Promise<AccountListResponse> {
    try {
      const accounts = await this.getLinkedAccounts(userId);
      const canUnlink = accounts.map(() => accounts.length > 1);
      const primaryProvider = accounts.length > 0 ? accounts[0].provider : undefined;

      return {
        success: true,
        accounts,
        primaryProvider,
        canUnlink
      };
    } catch (error: any) {
      logger.error('Failed to get linked accounts status:', error);
      throw error;
    }
  }

  async isOAuthAccountLinked(userId: string, provider: string): Promise<boolean> {
    try {
      const count = await OAuthAccountModel.countDocuments({ userId, provider });
      return count > 0;
    } catch (error: any) {
      return false;
    }
  }

  async findUserByOAuthAccount(provider: string, providerId: string): Promise<string | null> {
    try {
      const link = await OAuthAccountModel.findOne({ provider, providerId });
      return link ? link.userId : null;
    } catch (error: any) {
      return null;
    }
  }

  async updateOAuthAccountData(userId: string, provider: string, updates: Partial<any>): Promise<void> {
    try {
      await OAuthAccountModel.updateOne(
        { userId, provider },
        { ...updates, updatedAt: new Date() }
      );
    } catch (error: any) {
      logger.error('Failed to update OAuth account:', error);
      throw error;
    }
  }

  async disconnectAllOAuthAccounts(userId: string): Promise<void> {
    try {
      await OAuthAccountModel.deleteMany({ userId });
      logger.info(`✅ Disconnected all OAuth accounts for user: ${userId}`);
    } catch (error: any) {
      logger.error('Failed to disconnect OAuth accounts:', error);
      throw error;
    }
  }

  async getOAuthAccount(userId: string, provider: string): Promise<OAuthAccount | null> {
    try {
      const acc = await OAuthAccountModel.findOne({ userId, provider });
      if (!acc) return null;
      
      return {
        provider: acc.provider,
        id: acc.providerId,
        email: acc.email,
        displayName: acc.displayName,
        picture: acc.picture,
        connectedAt: acc.connectedAt,
        accessToken: acc.accessToken,
        refreshToken: acc.refreshToken
      };
    } catch (error: any) {
      return null;
    }
  }

  // Statistik & Migrasi (Optional implementation, stubbed for now)
  async migrateOAuthAccount(oldUserId: string, newUserId: string, provider: string): Promise<void> {
     await OAuthAccountModel.updateMany({ userId: oldUserId, provider }, { userId: newUserId });
  }

  async getOAuthStatistics(): Promise<any> {
    // Implementasi sederhana menggunakan count
    const totalLinkedAccounts = await OAuthAccountModel.countDocuments();
    return { totalLinkedAccounts, accountsByProvider: {}, usersWithOAuth: 0 };
  }
}

export default new OAuthService();