export enum MemerUpdateType {
  'remove' = -1,
  'addModifyToRegular' = 0,
  'addModifyToExecutive' = 2
}

export enum MemberType {
  'executive_leader' = 2,
  'owner' = 1,
  'member' = 0
}

export interface IMember {
  readonly id: number;
  school_group_id: number;
  username: string;
  gender: string;
  school_id: number;
  school_persona_id: number;
  status: number;
  user_type: number;
  looking_for: string;
  firstname: string;
  lastname: string;
  jid: string;
  avatar_url: string;
  profile_likes: number;
  avatar_thumb_url: string;
  relationship_status: number;
  campus_thread_points: number;
  campus_comment_points: number;
  profile_hots: number;
  profile_crushes: number;
  num_friends: number;
  user_cal_share: boolean;
  twitter_handler: string;
  instagram_handler: string;
  instagram_uid: number;
  cover_photo_url: string;
  member_type: number;
  member_position: string;
  email: string;
  last_login_epoch: number;
  has_avatar: boolean;
  specific_gender: string;
  student_identifier: string;
  access_level: number;
  social_restriction: boolean;
  social_restriction_school_ids: number[];
  date_of_last_sync?: number;
}
