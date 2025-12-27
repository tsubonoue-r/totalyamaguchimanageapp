// 基本型定義

export type ProjectStatus =
  | 'inquiry'      // 問い合わせ
  | 'estimating'   // 見積中
  | 'negotiating'  // 商談中
  | 'contracted'   // 契約済
  | 'designing'    // 設計中
  | 'manufacturing'// 製造中
  | 'installing'   // 施工中
  | 'completed'    // 完了
  | 'cancelled'    // キャンセル

export type ProjectPhase = 'sales' | 'design' | 'manufacturing' | 'construction'

// 顧客
export interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 案件（プロジェクト）
export interface Project {
  id: string
  projectNumber: string        // 案件番号 (例: YS-2024-001)
  name: string                 // 案件名
  customerId: string           // 顧客ID
  status: ProjectStatus        // ステータス
  currentPhase: ProjectPhase   // 現在のフェーズ

  // 基本情報
  description?: string         // 概要
  location: string             // 施工場所
  structureType: string        // 膜構造タイプ
  estimatedArea?: number       // 想定面積 (m²)

  // 金額
  estimatedAmount?: number     // 見積金額
  contractAmount?: number      // 契約金額

  // 日程
  inquiryDate: Date            // 問い合わせ日
  contractDate?: Date          // 契約日
  deliveryDate?: Date          // 納期
  completionDate?: Date        // 完了日

  // 担当者
  salesPersonId?: string       // 営業担当
  designerId?: string          // 設計担当
  productionManagerId?: string // 製造担当
  siteManagerId?: string       // 施工担当

  createdAt: Date
  updatedAt: Date
}

// 見積書
export interface Estimate {
  id: string
  projectId: string
  estimateNumber: string       // 見積番号
  version: number              // バージョン

  items: EstimateItem[]        // 明細
  subtotal: number             // 小計
  tax: number                  // 消費税
  total: number                // 合計

  validUntil: Date             // 有効期限
  notes?: string               // 備考
  status: 'draft' | 'submitted' | 'approved' | 'rejected'

  createdAt: Date
  updatedAt: Date
}

export interface EstimateItem {
  id: string
  description: string          // 項目名
  quantity: number             // 数量
  unit: string                 // 単位
  unitPrice: number            // 単価
  amount: number               // 金額
}

// 図面
export interface Drawing {
  id: string
  projectId: string
  drawingNumber: string        // 図面番号
  name: string                 // 図面名
  type: 'plan' | 'elevation' | 'detail' | 'structural' | 'other'
  version: number              // バージョン
  fileUrl: string              // ファイルURL
  status: 'draft' | 'review' | 'approved' | 'revision'

  createdBy: string
  reviewedBy?: string
  approvedBy?: string

  createdAt: Date
  updatedAt: Date
}

// 製造工程
export interface ProductionProcess {
  id: string
  projectId: string
  name: string                 // 工程名
  sequence: number             // 順序

  plannedStartDate: Date       // 予定開始日
  plannedEndDate: Date         // 予定終了日
  actualStartDate?: Date       // 実績開始日
  actualEndDate?: Date         // 実績終了日

  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  progress: number             // 進捗率 (0-100)

  assignedTo?: string          // 担当者
  notes?: string               // 備考

  createdAt: Date
  updatedAt: Date
}

// 材料
export interface Material {
  id: string
  projectId: string
  name: string                 // 材料名
  specification: string        // 仕様
  quantity: number             // 数量
  unit: string                 // 単位

  status: 'pending' | 'ordered' | 'received' | 'used'
  orderedDate?: Date           // 発注日
  expectedDate?: Date          // 入荷予定日
  receivedDate?: Date          // 入荷日

  supplier?: string            // 仕入先
  cost?: number                // 単価

  createdAt: Date
  updatedAt: Date
}

// 施工スケジュール
export interface ConstructionSchedule {
  id: string
  projectId: string

  tasks: ConstructionTask[]    // 作業項目

  plannedStartDate: Date       // 予定開始日
  plannedEndDate: Date         // 予定終了日
  actualStartDate?: Date       // 実績開始日
  actualEndDate?: Date         // 実績終了日

  status: 'pending' | 'in_progress' | 'completed' | 'delayed'

  createdAt: Date
  updatedAt: Date
}

export interface ConstructionTask {
  id: string
  name: string                 // 作業名
  sequence: number             // 順序

  plannedStartDate: Date
  plannedEndDate: Date
  actualStartDate?: Date
  actualEndDate?: Date

  status: 'pending' | 'in_progress' | 'completed'
  assignedTeam?: string        // 担当チーム
  notes?: string
}

// 検査記録
export interface Inspection {
  id: string
  projectId: string
  type: 'material' | 'production' | 'installation' | 'final'

  date: Date
  inspector: string            // 検査員
  result: 'pass' | 'fail' | 'conditional'

  checkItems: InspectionItem[]
  photos?: string[]            // 写真URL
  notes?: string

  createdAt: Date
  updatedAt: Date
}

export interface InspectionItem {
  id: string
  item: string                 // 検査項目
  standard: string             // 基準
  result: 'pass' | 'fail' | 'na'
  notes?: string
}

// ユーザー
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales' | 'designer' | 'production' | 'construction' | 'viewer'
  department: string
  phone?: string
  avatarUrl?: string

  createdAt: Date
  updatedAt: Date
}
