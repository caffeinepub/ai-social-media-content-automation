import React, { useState, useEffect } from 'react';
import { useGetBrandProfile, useCreateBrandProfile, useAddProduct } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store,
  Plus,
  Loader2,
  Upload,
  CheckCircle2,
  Package,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

const BRAND_ID = 'my-brand';
const TONES = [
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'luxury', label: 'Luxury & Premium' },
  { value: 'streetwear', label: 'Streetwear & Bold' },
];
const CATEGORIES = ['T-shirts', 'Jackets', 'Dresses', 'Pants', 'Accessories', 'Shoes', 'Outerwear', 'Other'];

export default function BrandProfileSetup() {
  const { data: profile, isLoading } = useGetBrandProfile(BRAND_ID);
  const createBrandProfile = useCreateBrandProfile();
  const addProduct = useAddProduct();

  // Brand form state
  const [brandName, setBrandName] = useState('');
  const [tone, setTone] = useState('casual');
  const [audience, setAudience] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('T-shirts');
  const [productDescription, setProductDescription] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);

  // Populate form from existing profile
  useEffect(() => {
    if (profile) {
      setBrandName(profile.name);
      setTone(profile.tone);
      setAudience(profile.audience);
      setProfileSaved(true);
    }
  }, [profile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveBrandProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !audience.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsUploading(true);
      let logoBlob: ExternalBlob;

      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        logoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
      } else if (profile?.logo) {
        logoBlob = profile.logo;
      } else {
        // Use placeholder logo
        const response = await fetch('/assets/generated/brand-logo.dim_128x128.png');
        const arrayBuffer = await response.arrayBuffer();
        logoBlob = ExternalBlob.fromBytes(new Uint8Array(arrayBuffer));
      }

      await createBrandProfile.mutateAsync({
        brandId: BRAND_ID,
        name: brandName.trim(),
        logo: logoBlob,
        tone,
        audience: audience.trim(),
        categories: CATEGORIES,
      });

      setProfileSaved(true);
      setUploadProgress(0);
      toast.success('Brand profile saved successfully!');
    } catch (err) {
      toast.error('Failed to save brand profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productDescription.trim()) {
      toast.error('Please fill in all product fields.');
      return;
    }

    try {
      await addProduct.mutateAsync({
        brandId: BRAND_ID,
        product: {
          name: productName.trim(),
          category: productCategory,
          description: productDescription.trim(),
        },
      });
      setProductName('');
      setProductDescription('');
      setProductCategory('T-shirts');
      setShowProductForm(false);
      toast.success('Product added to catalog!');
    } catch {
      toast.error('Failed to add product. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64 bg-charcoal-800" />
        <Skeleton className="h-64 rounded-xl bg-charcoal-800" />
        <Skeleton className="h-48 rounded-xl bg-charcoal-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Brand Profile</h1>
            <p className="text-muted-foreground text-sm">Set up your clothing brand identity</p>
          </div>
        </div>
      </div>

      {/* Brand Identity Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
            <Pencil size={18} className="text-coral-400" />
            Brand Identity
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Define your brand's voice and target audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBrandProfile} className="space-y-5">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Brand Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-secondary">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : profile?.logo ? (
                    <img
                      src={profile.logo.getDirectURL()}
                      alt="Brand logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated/brand-logo.dim_128x128.png';
                      }}
                    />
                  ) : (
                    <img
                      src="/assets/generated/brand-logo.dim_128x128.png"
                      alt="Default logo"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload size={14} className="mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name" className="text-foreground font-medium">
                  Brand Name <span className="text-coral-400">*</span>
                </Label>
                <Input
                  id="brand-name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Urban Thread Co."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Brand Tone / Voice</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-foreground hover:bg-secondary">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="text-foreground font-medium">
                Target Audience <span className="text-coral-400">*</span>
              </Label>
              <Textarea
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Fashion-forward millennials aged 18-35 who value sustainable style..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={createBrandProfile.isPending || isUploading}
              className="gradient-coral text-white border-0 hover:opacity-90 font-semibold"
            >
              {createBrandProfile.isPending || isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : profileSaved ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Update Profile
                </>
              ) : (
                'Save Brand Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Product Catalog */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                <Package size={18} className="text-coral-400" />
                Product Catalog
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Add products to generate targeted content
              </CardDescription>
            </div>
            {!showProductForm && (
              <Button
                size="sm"
                onClick={() => setShowProductForm(true)}
                className="gradient-coral text-white border-0 hover:opacity-90"
              >
                <Plus size={16} className="mr-1" />
                Add Product
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Products */}
          {profile?.catalog && profile.catalog.length > 0 ? (
            <div className="space-y-2">
              {profile.catalog.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="w-8 h-8 rounded-md bg-coral-400/15 flex items-center justify-center shrink-0">
                    <Package size={14} className="text-coral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showProductForm && (
              <div className="text-center py-8 text-muted-foreground">
                <Package size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No products yet. Add your first product to start generating content.</p>
              </div>
            )
          )}

          {/* Add Product Form */}
          {showProductForm && (
            <>
              {profile?.catalog && profile.catalog.length > 0 && <Separator className="bg-border" />}
              <form onSubmit={handleAddProduct} className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
                <h3 className="text-sm font-semibold text-foreground">New Product</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-foreground text-sm font-medium">Product Name</Label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Classic Denim Jacket"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground text-sm font-medium">Category</Label>
                    <Select value={productCategory} onValueChange={setProductCategory}>
                      <SelectTrigger className="bg-input border-border text-foreground text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-foreground hover:bg-secondary text-sm">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm font-medium">Description</Label>
                  <Textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Brief description of the product..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-sm"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addProduct.isPending}
                    className="gradient-coral text-white border-0 hover:opacity-90 font-semibold"
                  >
                    {addProduct.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="mr-1.5" />
                        Add Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
